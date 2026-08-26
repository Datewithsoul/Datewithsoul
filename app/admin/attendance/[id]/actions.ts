"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

export async function toggleAttendance(bookingId: string, status: boolean) {
  await requireAdmin();
  await prisma.booking.update({
    where: { id: bookingId },
    data: { attended: status }
  });
  
  revalidatePath("/admin/attendance", "page");
  revalidatePath("/admin/attendance/[id]", "page");
  return { success: true };
}
