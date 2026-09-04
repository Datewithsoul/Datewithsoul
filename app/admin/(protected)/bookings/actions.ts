"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus } from "@/app/generated/prisma";
import {
  isBookingStatus,
  paymentStatusForBooking,
  type AppBookingStatus,
} from "@/lib/booking-status";
import { requireAdmin } from "@/lib/require-admin";
import { sendLineMessage, sendTemplatedLineMessage } from "@/lib/line";

async function applyBookingStatus(bookingId: string, status: AppBookingStatus, reviewerId?: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, classEvent: true, payment: true },
  });

  if (!booking) {
    throw new Error("ไม่พบรายการจอง");
  }

  const previousStatus = booking.status;
  if (previousStatus === status) {
    return booking;
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (booking.bookingGroupId) {
      await tx.bookingGroup.update({
        where: { id: booking.bookingGroupId },
        data: { status: status as any },
      });
      const groupPayment = await tx.payment.findUnique({
        where: { bookingGroupId: booking.bookingGroupId },
      });
      if (groupPayment) {
        await tx.payment.update({
          where: { id: groupPayment.id },
          data: { status: paymentStatusForBooking(status) },
        });
      }
    }

    const paymentStatus = paymentStatusForBooking(status);
     if (booking.payment) {
      const prevPaymentStatus = booking.payment.status;
      await tx.payment.update({
        where: { bookingId },
        data: { status: paymentStatus },
      });
      if (reviewerId && prevPaymentStatus !== paymentStatus) {
        await tx.paymentReviewLog.create({
          data: {
             paymentId: booking.payment.id,
            reviewerId,
            previousStatus: prevPaymentStatus,
            newStatus: paymentStatus,
            reason
          }
        });
      }
    } else {
      const newPayment = await tx.payment.create({
        data: { bookingId, status: paymentStatus },
      });
       if (reviewerId) {
        await tx.paymentReviewLog.create({
          data: {
             paymentId: newPayment.id,
            reviewerId,
             previousStatus: PaymentStatus.UNPAID,
            newStatus: paymentStatus,
            reason
          }
        });
      }
    }

    if (previousStatus !== BookingStatus.CANCELLED && status === BookingStatus.CANCELLED) {
      await tx.classEvent.update({
        where: { id: booking.classEventId },
        data: { totalSeats: { increment: booking.seats } },
      });
    }

    if (previousStatus === BookingStatus.CANCELLED && status !== BookingStatus.CANCELLED) {
      await tx.classEvent.update({
        where: { id: booking.classEventId },
        data: { totalSeats: { decrement: booking.seats } },
      });
    }
  });

  if (booking.user.lineId) {
    const formattedDate = booking.classEvent.date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (status === BookingStatus.CONFIRMED) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "PAYMENT_VERIFIED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
          date: formattedDate,
          time: `${booking.classEvent.startTime} - ${booking.classEvent.endTime}`,
          location: booking.classEvent.locationName || "Date with Soul Love",
          mapUrl: booking.classEvent.googleMapUrl ? `แผนที่: ${booking.classEvent.googleMapUrl}` : "",
          seats: booking.seats,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "PAYMENT_VERIFIED",
        }
      );
    } else if (status === BookingStatus.PENDING_PAYMENT && reason) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "PAYMENT_REJECTED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
          reason: reason,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "PAYMENT_REJECTED",
        }
      );
    } else if (status === BookingStatus.CANCELLED) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "BOOKING_CANCELLED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "BOOKING_CANCELLED",
        }
      );
    }
  }

  return booking;
}

export async function updateBookingStatus(bookingId: string, status: string, reason?: string) {
  const admin = await requireAdmin();

  if (!isBookingStatus(status)) {
    return { success: false, error: "สถานะไม่ถูกต้อง" };
  }

  await applyBookingStatus(bookingId, status, admin.id, reason);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function confirmPayment(bookingId: string) {
  const admin = await requireAdmin();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { 
      payment: true,
      bookingGroup: {
        include: { payment: true }
      }
    },
  });

  if (!booking) {
    return { success: false, error: "ไม่พบรายการจอง" };
  }

  const hasSlip = booking.payment?.slipUrl || booking.bookingGroup?.payment?.slipUrl;
  if (!hasSlip) {
    return { success: false, error: "ยังไม่มีสลิปจากลูกค้า" };
  }

  await applyBookingStatus(bookingId, BookingStatus.CONFIRMED, admin.id);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function confirmGroupPayment(groupId: string) {
  const admin = await requireAdmin();

  const group = await prisma.bookingGroup.findUnique({
    where: { id: groupId },
    include: { payment: true, bookings: true },
  });

  if (!group) {
    return { success: false, error: "ไม่พบรายการจองแบบกลุ่ม" };
  }

  if (!group.payment?.slipUrl) {
    return { success: false, error: "ยังไม่มีสลิปจากลูกค้า" };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update group status
    await tx.bookingGroup.update({
      where: { id: groupId },
      data: { status: "CONFIRMED" },
    });

    // 2. Update group payment status
    if (group.payment) {
      const prevStatus = group.payment.status;
      await tx.payment.update({
        where: { id: group.payment.id },
        data: { status: "VERIFIED" },
      });
      if (prevStatus !== "VERIFIED") {
        await tx.paymentReviewLog.create({
          data: {
            paymentId: group.payment.id,
            reviewerId: admin.id,
            previousStatus: prevStatus,
            newStatus: "VERIFIED",
          }
        });
      }
    }

    // 3. Update all bookings in the group
    await tx.booking.updateMany({
      where: { bookingGroupId: groupId },
      data: { status: "CONFIRMED" },
    });
  });

  // 4. Send notifications
  const groupWithDetails = await prisma.bookingGroup.findUnique({
    where: { id: groupId },
    include: { user: true, bookings: { include: { classEvent: true } } },
  });
  
  if (groupWithDetails?.user?.lineId) {
    const classNames = groupWithDetails.bookings.map((b: any) => `• ${b.classEvent.name} (${new Date(b.classEvent.date).toLocaleDateString("th-TH")} ${b.classEvent.startTime}-${b.classEvent.endTime})`).join('\n');
    await sendTemplatedLineMessage(
      groupWithDetails.user.lineId,
      "PAYMENT_GROUP_VERIFIED_USER",
      {
        userName: groupWithDetails.user.name,
        classNames,
      },
      {
        userId: groupWithDetails.userId,
        type: "PAYMENT_GROUP_VERIFIED",
      }
    );
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateGroupBookingStatus(groupId: string, status: string, reason?: string) {
  const admin = await requireAdmin();

  if (!isBookingStatus(status)) {
    return { success: false, error: "สถานะไม่ถูกต้อง" };
  }

  const group = await prisma.bookingGroup.findUnique({
    where: { id: groupId },
    include: { bookings: true },
  });

  if (!group) return { success: false, error: "ไม่พบการจองกลุ่ม" };

  for (const b of group.bookings) {
    // This will reuse the existing logic and properly handle seats / lines
    await applyBookingStatus(b.id, status as any, admin.id, reason);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function changeBookingClass(bookingId: string, newClassEventId: string) {
  await requireAdmin();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, classEvent: true },
  });

  if (!booking) {
    return { success: false, error: "ไม่พบรายการจอง" };
  }

  if (booking.status === BookingStatus.CANCELLED) {
    return { success: false, error: "ไม่สามารถเปลี่ยนรอบของการจองที่ยกเลิกแล้วได้" };
  }

  if (booking.classEventId === newClassEventId) {
    return { success: false, error: "รอบเรียนที่เลือกเป็นรอบเดิมอยู่แล้ว" };
  }

  if (booking.changeCount >= 1) {
    return { success: false, error: "สามารถเปลี่ยนรอบเรียนได้เพียง 1 ครั้งเท่านั้น" };
  }

  const newClassEvent = await prisma.classEvent.findUnique({
    where: { id: newClassEventId },
  });

  if (!newClassEvent) {
    return { success: false, error: "ไม่พบรอบเรียนที่เลือก" };
  }

  if (newClassEvent.totalSeats < booking.seats) {
    return {
      success: false,
      error: `ที่นั่งในรอบที่เลือกไม่เพียงพอ (ว่าง ${newClassEvent.totalSeats} ที่ / ต้องการ ${booking.seats} ที่)`,
    };
  }

  await prisma.$transaction(async (tx) => {
    // คืนที่นั่งให้รอบเดิม
    await tx.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    // ลดที่นั่งในรอบใหม่
    await tx.classEvent.update({
      where: { id: newClassEventId },
      data: { totalSeats: { decrement: booking.seats } },
    });

    // อัปเดต booking ให้ชี้ไปรอบใหม่
    await tx.booking.update({
      where: { id: bookingId },
      data: { 
        classEventId: newClassEventId,
        changeCount: { increment: 1 }
      },
    });
  });

  // แจ้งลูกค้าทาง LINE
  if (booking.user.lineId) {
    const dateStr = newClassEvent.date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const message = `ทีมงานได้ยืนยันการเปลี่ยนรอบเรียนของคุณเป็น "${newClassEvent.name}" วันที่ ${dateStr} เวลา ${newClassEvent.startTime}–${newClassEvent.endTime} น.\n(หมายเหตุ: สามารถเปลี่ยนวันเรียนได้เพียง 1 ครั้งเท่านั้น) หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่ค่ะ`;
    await sendLineMessage(booking.user.lineId, message);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}
export async function adminCreateBooking(formData: FormData) {
  const admin = await requireAdmin();
  
  // User selection / creation
  let userId = formData.get("userId") as string | null;
  const newCustomerName = formData.get("customerName") as string | null;
  const newCustomerPhone = formData.get("customerPhone") as string | null;
  
  const classEventId = formData.get("classEventId") as string;
  const seatsStr = formData.get("seats") as string;
  const seats = parseInt(seatsStr, 10);
  const note = formData.get("note") as string;
  const markAsPaid = formData.get("markAsPaid") === "on";

  if (!classEventId || isNaN(seats) || seats <= 0) {
    return { success: false, error: "ข้อมูลการจองไม่ครบถ้วนหรือไม่ถูกต้อง" };
  }

  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } else if (newCustomerName) {
    if (newCustomerPhone) {
      user = await prisma.user.findFirst({ where: { phone: newCustomerPhone } });
    }
    if (!user) {
       user = await prisma.user.create({
         data: {
           name: newCustomerName,
           phone: newCustomerPhone || null,
         }
       });
    }
  }

  if (!user) {
    return { success: false, error: "กรุณาเลือกลูกค้า หรือระบุชื่อลูกค้าใหม่" };
  }

  const classEvent = await prisma.classEvent.findUnique({ where: { id: classEventId } });

  if (!classEvent) {
    return { success: false, error: "ไม่พบข้อมูลคอร์สเรียน" };
  }

  if (classEvent.totalSeats < seats) {
    return { success: false, error: `ที่นั่งไม่เพียงพอ (เหลือ ${classEvent.totalSeats} ที่)` };
  }

  const totalPrice = classEvent.price * seats;

  const booking = await prisma.$transaction(async (tx) => {
    await tx.classEvent.update({
      where: { id: classEventId },
      data: { totalSeats: { decrement: seats } },
    });

    const b = await tx.booking.create({
      data: {
        userId: user!.id,
        classEventId,
        seats,
        totalPrice,
        note,
        status: markAsPaid ? BookingStatus.CONFIRMED : BookingStatus.PENDING_PAYMENT,
      },
    });

    await tx.payment.create({
      data: {
        bookingId: b.id,
        status: markAsPaid ? PaymentStatus.VERIFIED : PaymentStatus.UNPAID,
      },
    });

    return b;
  });

  if (user.lineId) {
    const formattedDate = classEvent.date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (markAsPaid) {
      await sendTemplatedLineMessage(
        user.lineId,
        "PAYMENT_VERIFIED_USER",
        {
          userName: user.name,
          className: classEvent.name,
          date: formattedDate,
          time: `${classEvent.startTime} - ${classEvent.endTime}`,
          location: classEvent.locationName || "Date with Soul Love",
          mapUrl: classEvent.googleMapUrl ? `แผนที่: ${classEvent.googleMapUrl}` : "",
          seats: seats,
        },
        {
          userId: user.id,
          bookingId: booking.id,
          type: "PAYMENT_VERIFIED",
        }
      );
    } else {
      await sendTemplatedLineMessage(
        user.lineId,
        "BOOKING_CREATED_USER",
        {
          userName: user.name,
          className: classEvent.name,
          seats: seats,
          totalPrice: totalPrice.toLocaleString("th-TH"),
        },
        {
          userId: user.id,
          bookingId: booking.id,
          type: "BOOKING_CREATED",
        }
      );
    }
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}
