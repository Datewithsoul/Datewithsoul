"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAttendance(bookingId: string, status: boolean) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { attended: status }
  });
  
  revalidatePath("/admin/classes/[id]/attendance", "page");
  return { success: true };
}
