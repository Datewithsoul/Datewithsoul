"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { uploadMedia } from "@/utils/supabase/storage";

export async function updateClass(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructor = "ไม่ระบุผู้สอน";
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string) || "เวิร์กชอป";
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
  let schedules: { date: string, endDate: string, startTime: string, endTime: string, totalSeats: string }[] = [];
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

    // Update the current class event with the first schedule
    await prisma.classEvent.update({
      where: { id },
      data: {
        name,
        description,
        category,
        instructor,
        date: firstDate,
        endDate,
        startTime: firstSchedule.startTime,
        endTime: firstSchedule.endTime,
        price,
        totalSeats: parseInt(firstSchedule.totalSeats, 10),
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

    // Create new class events for any additional schedules
    for (let i = 1; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.date) continue;
      
      const dDate = new Date(schedule.date);
      
      await prisma.classEvent.create({
        data: {
          name,
          description,
          category,
          instructor,
          date: dDate,
          endDate: null,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          price,
          totalSeats: parseInt(schedule.totalSeats, 10),
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
        status: { in: ["BOOKING", "AWAITING_PAYMENT", "PAYMENT_REVIEW", "PAID"] }
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

  redirect("/admin/classes");
}
