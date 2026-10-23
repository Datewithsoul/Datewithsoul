"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { uploadMedia } from "@/utils/supabase/storage";
import { requireAdmin } from "@/lib/require-admin";
import { ClassEventStatus } from "@/app/generated/prisma";
import { ensurePausedClassStatus } from "@/lib/class-event-status";

export async function updateClass(formData: FormData) {
  try {
    await requireAdmin();
    await ensurePausedClassStatus();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    if (!name) throw new Error("ชื่อคอร์สไม่สามารถเว้นว่างได้");
    
    const description = formData.get("description") as string;
    const instructor = "ไม่ระบุผู้สอน";
    const price = parseFloat(formData.get("price") as string) || 0;
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
      
      const totalSeats = parseInt(firstSchedule.totalSeats, 10);

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
          date: isNaN(firstDate.getTime()) ? new Date() : firstDate,
          endDate: firstEndDate,
          startTime: firstSchedule.startTime || "00:00",
          endTime: firstSchedule.endTime || "00:00",
          price,
          totalSeats: isNaN(totalSeats) ? 0 : totalSeats,
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
        const sTotalSeats = parseInt(schedule.totalSeats, 10);
        
        await prisma.classEvent.create({
          data: {
            name,
            description,
            category,
            locationName,
            googleMapUrl,
            instructor,
            date: isNaN(dDate.getTime()) ? new Date() : dDate,
            endDate: dEndDate,
            startTime: schedule.startTime || "00:00",
            endTime: schedule.endTime || "00:00",
            price,
            totalSeats: isNaN(sTotalSeats) ? 0 : sTotalSeats,
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
  } catch (error: any) {
    console.error("updateClass Error:", error);
  }
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function updateGroupClass(formData: FormData) {
  try {
    await requireAdmin();
    await ensurePausedClassStatus();
    const originalName = formData.get("originalName") as string;
    const classEventIds = (formData.get("classEventIds") as string || "").split(",").filter(Boolean);
    
    const name = formData.get("name") as string;
    if (!name) throw new Error("ชื่อคอร์สไม่สามารถเว้นว่างได้");

    const description = formData.get("description") as string;
    const instructor = "ไม่ระบุผู้สอน";
    const price = parseFloat(formData.get("price") as string) || 0;
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
      
      const totalSeats = parseInt(schedule.totalSeats, 10);

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
        date: isNaN(dDate.getTime()) ? new Date() : dDate,
        endDate: dEndDate,
        startTime: schedule.startTime || "00:00",
        endTime: schedule.endTime || "00:00",
        totalSeats: isNaN(totalSeats) ? 0 : totalSeats,
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
  } catch (error: any) {
    console.error("updateGroupClass Error:", error);
  }
  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;
  
  if (!file || !path) {
    throw new Error("Missing file or path");
  }

  const url = await uploadMedia(file, path);
  return url;
}

export async function deleteClass(formData: FormData) {
  await requireAdmin();
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
  await requireAdmin();
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

/**
 * Deletes every round of a class (all non-deleted ClassEvents sharing `className`).
 * Rounds nobody ever booked are removed outright. Rounds with bookings are only
 * marked deleted and hidden from customers, so bookings, payments and slips stay as history.
 */
export async function deleteClassGroup(className: string) {
  await requireAdmin();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const events = await tx.classEvent.findMany({
        where: { name: className, deletedAt: null },
        select: { id: true, _count: { select: { bookings: true } } },
      });
      if (events.length === 0) throw new Error("ไม่พบคอร์สนี้ อาจถูกลบไปแล้ว");

      const archivedIds = events.filter((e) => e._count.bookings > 0).map((e) => e.id);
      const removedIds = events.filter((e) => e._count.bookings === 0).map((e) => e.id);

      await tx.classEvent.updateMany({
        where: { id: { in: archivedIds } },
        data: { deletedAt: new Date(), status: ClassEventStatus.DRAFT },
      });

      // Change requests may point at a removed round; keep the request, drop the link
      await tx.changeRequest.updateMany({ where: { originalEventId: { in: removedIds } }, data: { originalEventId: null } });
      await tx.changeRequest.updateMany({ where: { requestedEventId: { in: removedIds } }, data: { requestedEventId: null } });
      // Class media and promo links cascade
      await tx.classEvent.deleteMany({ where: { id: { in: removedIds } } });

      return { archivedCount: archivedIds.length, removedCount: removedIds.length };
    });

    revalidatePath("/", "layout");
    return { success: true, ...result };
  } catch (error: unknown) {
    console.error("deleteClassGroup Error:", error);
    return { success: false, error: (error instanceof Error && error.message) || "ลบคอร์สไม่สำเร็จ" };
  }
}

/**
 * Temporarily closes (or reopens) booking for every round of a class.
 * Only touches PUBLISHED <-> PAUSED rounds, so finished, cancelled and draft rounds stay as they are.
 */
export async function setClassGroupBookingPaused(className: string, paused: boolean) {
  await requireAdmin();
  await ensurePausedClassStatus();

  const [from, to] = paused
    ? [ClassEventStatus.PUBLISHED, ClassEventStatus.PAUSED]
    : [ClassEventStatus.PAUSED, ClassEventStatus.PUBLISHED];

  try {
    const { count } = await prisma.classEvent.updateMany({
      where: { name: className, deletedAt: null, status: from },
      data: { status: to },
    });
    if (count === 0) {
      return { success: false, error: paused ? "ไม่มีรอบที่เปิดรับจองอยู่" : "ไม่มีรอบที่ปิดจองชั่วคราวอยู่" };
    }

    revalidatePath("/", "layout");
    return { success: true, count };
  } catch (error: unknown) {
    console.error("setClassGroupBookingPaused Error:", error);
    return { success: false, error: "เปลี่ยนสถานะการจองไม่สำเร็จ" };
  }
}

// Rounds customers can see; hiding moves these to DRAFT
const VISIBLE_CLASS_STATUSES: ClassEventStatus[] = [
  ClassEventStatus.PUBLISHED,
  ClassEventStatus.PAUSED,
  ClassEventStatus.COMPLETED,
];

/**
 * Hides every round of a class from customers (status DRAFT), or shows it again.
 * Showing reopens upcoming rounds for booking and marks past rounds as completed.
 */
export async function setClassGroupHidden(className: string, hidden: boolean) {
  await requireAdmin();
  // VISIBLE_CLASS_STATUSES includes PAUSED, which older databases don't have yet
  await ensurePausedClassStatus();

  try {
    let count = 0;
    if (hidden) {
      ({ count } = await prisma.classEvent.updateMany({
        where: { name: className, deletedAt: null, status: { in: VISIBLE_CLASS_STATUSES } },
        data: { status: ClassEventStatus.DRAFT },
      }));
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [upcoming, past] = await prisma.$transaction([
        prisma.classEvent.updateMany({
          where: { name: className, deletedAt: null, status: ClassEventStatus.DRAFT, date: { gte: today } },
          data: { status: ClassEventStatus.PUBLISHED },
        }),
        prisma.classEvent.updateMany({
          where: { name: className, deletedAt: null, status: ClassEventStatus.DRAFT, date: { lt: today } },
          data: { status: ClassEventStatus.COMPLETED },
        }),
      ]);
      count = upcoming.count + past.count;
    }

    if (count === 0) {
      return { success: false, error: hidden ? "คอร์สนี้ซ่อนอยู่แล้ว" : "ไม่มีรอบที่ซ่อนอยู่" };
    }

    revalidatePath("/", "layout");
    return { success: true, count };
  } catch (error: unknown) {
    console.error("setClassGroupHidden Error:", error);
    return { success: false, error: hidden ? "ซ่อนคอร์สไม่สำเร็จ" : "แสดงคอร์สไม่สำเร็จ" };
  }
}
