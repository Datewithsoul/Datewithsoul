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
