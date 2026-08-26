"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadMedia } from "@/utils/supabase/storage";

export async function updateClass(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructor = "ไม่ระบุผู้สอน";
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string) || "เวิร์กชอป";
  const locationName = formData.get("locationName") as string || "Date with Soul Love";
  const googleMapUrl = formData.get("googleMapUrl") as string || null;
  const endDate = null;
  const status = formData.get("status") as any;
  
  const learningOutcomes = formData.getAll("learningOutcomes").map(s => String(s).trim()).filter(Boolean);
  const requirements = formData.getAll("requirements").map(s => String(s).trim()).filter(Boolean);

  const mediaJson = formData.get("mediaJson") as string;
  let mediaItems: { url: string, type: string, order: number }[] = [];
  
  try {
    if (mediaJson) {
      mediaItems = JSON.parse(mediaJson);
    }
  } catch (e) {
    console.error("Failed to parse media JSON", e);
  }

  const schedulesJson = formData.get("schedulesJson") as string;
  let schedules: { date: string, endDate?: string, startTime: string, endTime: string, totalSeats: string, status?: string }[] = [];
  try {
    if (schedulesJson) {
      schedules = JSON.parse(schedulesJson);
    }
  } catch (e) {
    console.error("Failed to parse schedulesJson", e);
  }

  // Delete all existing media for this class
  await prisma.classMedia.deleteMany({
    where: { classEventId: id }
  });

  if (schedules.length > 0) {
    const firstSchedule = schedules[0];
    const firstDate = new Date(firstSchedule.date);
    const firstEndDate = firstSchedule.endDate ? new Date(firstSchedule.endDate) : null;

    // Update the current class event with the first schedule
    await prisma.classEvent.update({
      where: { id },
      data: {
        name,
        description,
        category,
        locationName,
        googleMapUrl,
        instructor,
        date: firstDate,
        endDate: firstEndDate,
        startTime: firstSchedule.startTime,
        endTime: firstSchedule.endTime,
        price,
        totalSeats: parseInt(firstSchedule.totalSeats, 10),
        status: (firstSchedule.status as any) || status || undefined,
        learningOutcomes,
        requirements,
        media: {
          create: mediaItems.map(m => ({
            url: m.url,
            type: m.type,
            order: m.order
          }))
        }
      },
    });

    // Create new class events for any additional schedules
    for (let i = 1; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.date) continue;
      
      const dDate = new Date(schedule.date);
      const dEndDate = schedule.endDate ? new Date(schedule.endDate) : null;
      
      await prisma.classEvent.create({
        data: {
          name,
          description,
          category,
          locationName,
          googleMapUrl,
          instructor,
          date: dDate,
          endDate: dEndDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          price,
          totalSeats: parseInt(schedule.totalSeats, 10),
          status: (schedule.status as any) || status || undefined,
          learningOutcomes,
          requirements,
          media: {
            create: mediaItems.map(m => ({
              url: m.url,
              type: m.type,
              order: m.order
            }))
          }
        }
      });
    }

  } else {
    // Fallback if something went wrong
    await prisma.classEvent.update({
      where: { id },
      data: {
        name,
        description,
        category,
        locationName,
        googleMapUrl,
        instructor,
        price,
        status: status || undefined,
        learningOutcomes,
        requirements,
        media: {
          create: mediaItems.map(m => ({
            url: m.url,
            type: m.type,
            order: m.order
          }))
        }
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function updateGroupClass(formData: FormData) {
  const originalName = formData.get("originalName") as string;
  const classEventIds = (formData.get("classEventIds") as string || "").split(",").filter(Boolean);
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructor = "ไม่ระบุผู้สอน";
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string) || "เวิร์กชอป";
  const locationName = formData.get("locationName") as string || "Date with Soul Love";
  const googleMapUrl = formData.get("googleMapUrl") as string || null;
  const status = formData.get("status") as any;
  
  const learningOutcomes = formData.getAll("learningOutcomes").map(s => String(s).trim()).filter(Boolean);
  const requirements = formData.getAll("requirements").map(s => String(s).trim()).filter(Boolean);

  const mediaJson = formData.get("mediaJson") as string;
  let mediaItems: { url: string, type: string, order: number }[] = [];
  try {
    if (mediaJson) mediaItems = JSON.parse(mediaJson);
  } catch (e) {}

  const schedulesJson = formData.get("schedulesJson") as string;
  let schedules: { id?: string, date: string, endDate?: string, startTime: string, endTime: string, totalSeats: string, status?: string }[] = [];
  try {
    if (schedulesJson) schedules = JSON.parse(schedulesJson);
  } catch (e) {}

  const submittedIds = schedules.map(s => s.id).filter(Boolean) as string[];
  const idsToDelete = classEventIds.filter(id => !submittedIds.includes(id));

  // Handle deletions first
  if (idsToDelete.length > 0) {
    for (const idToDelete of idsToDelete) {
      const bookingsCount = await prisma.booking.count({
        where: { classEventId: idToDelete }
      });
      if (bookingsCount === 0) {
        await prisma.classMedia.deleteMany({ where: { classEventId: idToDelete } });
        await prisma.classEvent.delete({ where: { id: idToDelete } });
      } else {
        await prisma.classEvent.update({
          where: { id: idToDelete },
          data: { status: "CANCELLED" }
        });
      }
    }
  }

  for (const schedule of schedules) {
    if (!schedule.date) continue;
    const dDate = new Date(schedule.date);
    const dEndDate = schedule.endDate ? new Date(schedule.endDate) : null;

    const commonData = {
      name,
      description,
      category,
      locationName,
      googleMapUrl,
      instructor,
      price,
      status: (schedule.status as any) || status || undefined,
      learningOutcomes,
      requirements,
      date: dDate,
      endDate: dEndDate,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      totalSeats: parseInt(schedule.totalSeats, 10),
    };

    if (schedule.id) {
      // Delete existing media for this class event before updating
      await prisma.classMedia.deleteMany({
        where: { classEventId: schedule.id }
      });
      // Update existing
      await prisma.classEvent.update({
        where: { id: schedule.id },
        data: {
          ...commonData,
          media: {
            create: mediaItems.map(m => ({ url: m.url, type: m.type, order: m.order }))
          }
        }
      });
    } else {
      // Create new
      await prisma.classEvent.create({
        data: {
          ...commonData,
          media: {
            create: mediaItems.map(m => ({ url: m.url, type: m.type, order: m.order }))
          }
        }
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;
  
  if (!file || !path) {
    throw new Error("Missing file or path");
  }

  const url = await uploadMedia(file, path);
  return url;
}

export async function deleteClass(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.$transaction(async (tx) => {
    // 1. Mark the class as CANCELLED
    await tx.classEvent.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    // 2. Cancel all active bookings
    const activeBookings = await tx.booking.findMany({
      where: {
        classEventId: id,
        status: { in: ["PENDING_PAYMENT", "PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED"] }
      },
      include: {
        payment: true,
      }
    });

    for (const booking of activeBookings) {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" }
      });
      if (booking.payment) {
        await tx.payment.update({
          where: { bookingId: booking.id },
          data: { status: "REJECTED" }
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function closeClass(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.classEvent.update({
    where: { id },
    data: { status: "COMPLETED" }
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}
