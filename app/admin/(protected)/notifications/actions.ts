"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendLineMessage } from "@/lib/line";

export async function retryNotification(formData: FormData) {
  await requireAdmin();
  const notificationId = formData.get("id") as string;
  
  if (!notificationId) {
    return { error: "Missing notification ID" };
  }

  const notification = await prisma.notificationLog.findUnique({
    where: { id: notificationId },
    include: { user: true },
  });
  if (!notification) return { error: "ไม่พบรายการแจ้งเตือน" };
  if (!notification.user.lineId) return { error: "ผู้รับยังไม่ได้เชื่อมต่อ LINE" };
  if (!notification.message) return { error: "รายการแจ้งเตือนไม่มีข้อความสำหรับส่งซ้ำ" };

  const sent = await sendLineMessage(notification.user.lineId, notification.message);
  if (!sent) return { error: "ส่งข้อความซ้ำไม่สำเร็จ" };

  await prisma.notificationLog.create({
    data: {
      userId: notification.userId,
      bookingId: notification.bookingId,
      type: notification.type,
      message: notification.message,
    },
  });

  revalidatePath("/admin/notifications");
  return { success: true };
}
