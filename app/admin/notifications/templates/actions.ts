"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ensureMessageTemplateTable,
  TEMPLATE_DEFINITIONS,
  renderTemplate,
} from "@/lib/message-templates";
import { sendLineMessage } from "@/lib/line";
import { createClient } from "@/utils/supabase/server";

export async function saveTemplateAction(formData: FormData) {
  const key = formData.get("key") as string;
  const content = formData.get("content") as string;
  const enabled = formData.get("enabled") === "true";

  if (!key || typeof content !== "string") {
    return { success: false, error: "ข้อมูลไม่ครบถ้วน" };
  }

  const def = TEMPLATE_DEFINITIONS.find((t) => t.key === key);
  if (!def) {
    return { success: false, error: "ไม่พบเทมเพลตที่ระบุ" };
  }

  await ensureMessageTemplateTable();

  try {
    await prisma.messageTemplate.upsert({
      where: { key },
      create: {
        key,
        title: def.title,
        description: def.description,
        category: def.category,
        content,
        variables: def.variables.map((v) => v.name),
        enabled,
      },
      update: {
        content,
        enabled,
        variables: def.variables.map((v) => v.name),
      },
    });

    revalidatePath("/admin/notifications/templates");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving template:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึก" };
  }
}

export async function resetTemplateAction(key: string) {
  if (!key) {
    return { success: false, error: "ไม่พบ Key ของเทมเพลต" };
  }

  const def = TEMPLATE_DEFINITIONS.find((t) => t.key === key);
  if (!def) {
    return { success: false, error: "ไม่พบเทมเพลตที่ระบุ" };
  }

  await ensureMessageTemplateTable();

  try {
    await prisma.messageTemplate.upsert({
      where: { key },
      create: {
        key,
        title: def.title,
        description: def.description,
        category: def.category,
        content: def.defaultContent,
        variables: def.variables.map((v) => v.name),
        enabled: true,
      },
      update: {
        content: def.defaultContent,
        enabled: true,
      },
    });

    revalidatePath("/admin/notifications/templates");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error resetting template:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการรีเซ็ต" };
  }
}

export async function sendTestMessageAction(
  key: string,
  content: string,
  targetLineId?: string
) {
  const def = TEMPLATE_DEFINITIONS.find((t) => t.key === key);
  if (!def) {
    return { success: false, error: "ไม่พบเทมเพลต" };
  }

  // Generate mock variables map
  const dummyVariables: Record<string, string> = {};
  for (const v of def.variables) {
    dummyVariables[v.name] = v.example;
  }

  const renderedText = renderTemplate(content, dummyVariables);

  let targetId = targetLineId?.trim();
  if (!targetId) {
    // Attempt to find current admin's line ID
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { lineId: true },
      });
      targetId = dbUser?.lineId || undefined;
    }
  }

  if (!targetId) {
    return {
      success: false,
      error: "ไม่พบ LINE User ID สำหรับรับข้อความทดสอบ กรุณาระบุ LINE ID หรือเข้าสู่ระบบด้วยบัญชีแอดมินที่มี LINE ID",
    };
  }

  const testHeader = `🧪 [ข้อความทดสอบ]\n${renderedText}`;
  const sent = await sendLineMessage(targetId, testHeader);

  if (!sent) {
    return {
      success: false,
      error: "ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบว่า LINE OA Channel Token ถูกต้องและบอทสามารถติดต่อ LINE User ID นี้ได้",
    };
  }

  return { success: true, message: `ส่งข้อความทดสอบไปยัง LINE เรียบร้อยแล้ว` };
}

export async function sendCustomTestBroadcastAction({
  targetType,
  message,
  targetLineId,
}: {
  targetType: "USER" | "ADMIN" | "ALL";
  message: string;
  targetLineId?: string;
}) {
  if (!message || !message.trim()) {
    return { success: false, error: "กรุณาระบุข้อความที่ต้องการส่ง" };
  }

  const textToSend = `🧪 [ข้อความทดสอบ]\n${message.trim()}`;
  const sentTargets: string[] = [];

  // Fetch admin line IDs
  const adminUsers = await prisma.user.findMany({
    where: { role: "ADMIN", lineId: { not: null } },
    select: { id: true, name: true, lineId: true },
  });
  const adminLineIds = Array.from(
    new Set(adminUsers.map((a) => a.lineId).filter((id): id is string => Boolean(id)))
  );

  if (targetType === "ADMIN" || targetType === "ALL") {
    if (adminLineIds.length === 0 && targetType === "ADMIN") {
      return {
        success: false,
        error: "ไม่พบบัญชี Admin ที่เชื่อมต่อ LINE ID ในระบบ กรุณาตรวจสอบว่ามีผู้ใช้ที่มีสิทธิ์ Admin และมี LINE ID",
      };
    }
    for (const admin of adminUsers) {
      if (admin.lineId) {
        const ok = await sendLineMessage(admin.lineId, textToSend);
        if (ok) {
          sentTargets.push(`Admin (${admin.name || admin.lineId})`);
          try {
            await prisma.notificationLog.create({
              data: {
                userId: admin.id,
                type: "TEST_MESSAGE",
                message: textToSend,
              },
            });
          } catch (e) {
            console.warn("Could not log test notification:", e);
          }
        }
      }
    }
  }

  if (targetType === "USER" || targetType === "ALL") {
    const userLineId = targetLineId?.trim();
    if (!userLineId && targetType === "USER") {
      return {
        success: false,
        error: "กรุณาระบุ LINE User ID ของผู้ใช้ที่ต้องการส่งทดสอบ",
      };
    }
    if (userLineId) {
      const ok = await sendLineMessage(userLineId, textToSend);
      if (ok) {
        sentTargets.push(`User (${userLineId})`);
        try {
          const recipientUser = await prisma.user.findFirst({
            where: { lineId: userLineId },
            select: { id: true },
          });
          if (recipientUser) {
            await prisma.notificationLog.create({
              data: {
                userId: recipientUser.id,
                type: "TEST_MESSAGE",
                message: textToSend,
              },
            });
          }
        } catch (e) {
          console.warn("Could not log test notification for user:", e);
        }
      } else if (targetType === "USER") {
        return {
          success: false,
          error: `ส่งข้อความไปยัง LINE ID "${userLineId}" ไม่สำเร็จ กรุณาตรวจสอบว่าบอท LINE OA เชื่อมต่อได้และผู้ใช้เพิ่มเพื่อนบอทแล้ว`,
        };
      }
    }
  }

  if (sentTargets.length === 0) {
    return {
      success: false,
      error: "ส่งข้อความไม่สำเร็จ กรุณาตรวจสอบว่า LINE Channel Access Token ถูกต้องและมีปลายทางผู้รับ",
    };
  }

  revalidatePath("/admin/notifications");

  return {
    success: true,
    message: `ส่งข้อความทดสอบสำเร็จ (${sentTargets.length} ปลายทาง: ${
      targetType === "ADMIN"
        ? "เฉพาะแอดมิน"
        : targetType === "USER"
        ? "เฉพาะผู้ใช้"
        : "ทั้งหมด (แอดมิน + ผู้ใช้)"
    })`,
  };
}
