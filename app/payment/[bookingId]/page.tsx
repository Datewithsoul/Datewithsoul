import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/navbar";
import PaymentTimer from "@/components/payment-timer";
import { SlipUploadForm } from "@/components/slip-upload-form";
import { uploadSlip } from "./actions";
import { slipViewUrl } from "@/lib/slips";
import { StatusHero } from "@/components/motion/status-hero";
import { BookingProgress } from "@/components/motion/booking-progress";
import { sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";

export default async function PaymentPage({ params, searchParams }: { params: Promise<{ bookingId: string }>, searchParams: Promise<{ error?: string }> }) {
  const { bookingId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      classEvent: true,
      payment: true,
    }
  });

  if (!booking) {
    notFound();
  }

  if (!user) {
    redirect("/login");
  }

  if (user.id !== booking.userId) {
    redirect("/bookings");
  }

  if (booking.bookingGroupId) {
    redirect(`/payment/group/${booking.bookingGroupId}`);
  }

  const now = new Date();
  const expiryTime = new Date(booking.createdAt.getTime() + 10 * 60 * 1000);
  const isExpired = now > expiryTime;

  // Handle expired status
  if (isExpired && booking.status === "PENDING_PAYMENT") {
    // We do a quiet update here, though cron/actions also handle this
    await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: { id: bookingId, status: "PENDING_PAYMENT" },
        data: { status: "CANCELLED" },
      });
      if (updated.count === 0) return;
      await tx.classEvent.update({
        where: { id: booking.classEventId },
        data: { totalSeats: { increment: booking.seats } },
      });
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { status: "REJECTED" },
        });
      }
    });
    if (booking.user.lineId) {
      await sendTemplatedLineMessage(booking.user.lineId, "BOOKING_EXPIRED_USER", {
        userName: booking.user.name,
        className: booking.classEvent.name,
      }, { userId: booking.userId, bookingId: booking.id, type: "BOOKING_EXPIRED" });
    }
    await notifyAdminsTemplated("ADMIN_BOOKING_EXPIRED", {
      userName: booking.user.name,
      className: booking.classEvent.name,
    });
    booking.status = "CANCELLED";
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <section className="pt-12 px-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 animate-fade-up">ชำระเงิน</h1>
          <p className="text-gray-500 animate-fade-up" style={{ "--delay": "80ms" } as React.CSSProperties}>
            รหัสการจอง: {booking.id.split("-")[0].toUpperCase()}
          </p>
          {booking.status !== "CANCELLED" && <BookingProgress status={booking.status} className="mt-8" />}
        </div>

        {error === "expired" && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">
            รายการจองนี้หมดเวลาชำระเงินและถูกยกเลิกแล้ว กรุณาทำรายการจองใหม่
          </div>
        )}

        {error === "upload_failed" && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p>ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง</p>
            <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
              หากยังมีปัญหา ติดต่อแอดมินผ่าน LINE OA
            </a>
          </div>
        )}

        {error && error !== "expired" && error !== "upload_failed" && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p>{error}</p>
            <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
              ติดต่อแอดมินผ่าน LINE OA
            </a>
          </div>
        )}

        {booking.status === "CANCELLED" ? (
          <StatusHero
            variant="cancelled"
            title="หมดเวลาชำระเงิน"
            description="รายการจองนี้ถูกยกเลิกแล้ว เนื่องจากเกินเวลาที่กำหนด (10 นาที)"
          >
            <Link
              href="/classes"
              className="inline-block bg-[#222222] hover:bg-black text-white px-8 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
            >
              กลับไปดูคลาสเรียนทั้งหมด
            </Link>
          </StatusHero>
        ) : booking.status === "CONFIRMED" ? (
          <StatusHero
            variant="success"
            title="ชำระเงินเรียบร้อยแล้ว!"
            description="แอดมินตรวจสอบสลิปและยืนยันการชำระเงินแล้ว พบกันในวันคลาสเรียนนะครับ/ค่ะ"
            confettiKey={booking.id}
          >
            <Link
              href="/bookings"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
            >
              ดูประวัติการจอง
            </Link>
          </StatusHero>
        ) : booking.status === "PAYMENT_REVIEW" ? (
          <StatusHero
            variant="review"
            title="กำลังตรวจสอบการชำระเงิน"
            description="เราได้รับสลิปของคุณแล้ว กำลังรอแอดมินตรวจสอบ เมื่อยืนยันแล้วสถานะจะเปลี่ยนเป็นชำระเงินแล้ว"
          >
            {booking.payment?.slipUrl ? (
              <img src={slipViewUrl(booking.payment)!} alt="สลิปที่ส่งแล้ว" className="mx-auto mb-8 max-h-64 rounded-lg border border-yellow-200 shadow-sm" />
            ) : null}
            <Link
              href="/bookings"
              className="inline-block bg-[#222222] hover:bg-black text-white px-8 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5"
            >
              ดูประวัติการจอง
            </Link>
          </StatusHero>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column: QR Code & Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center animate-fade-up" style={{ "--delay": "150ms" } as React.CSSProperties}>
              <div className="w-full mb-6">
                <PaymentTimer createdAt={booking.createdAt} bookingId={booking.id} />
              </div>
              
              <h2 className="text-lg font-semibold mb-2">สแกนจ่ายผ่านพร้อมเพย์</h2>
              <div className="bg-[#113566] text-white px-3 py-1 rounded-md font-semibold text-xs mb-6">
                PromptPay
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 w-64 h-64 flex items-center justify-center mb-6 shadow-sm animate-pop-in" style={{ "--delay": "400ms" } as React.CSSProperties}>
                <img src="/qrcode.jpg" alt="PromptPay QR Code" className="w-full h-full object-contain" />
              </div>
              
              <div className="text-3xl font-bold text-[#F44336] mb-4">
                ฿{booking.totalPrice.toLocaleString()}
              </div>
              
              <div className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                  <span className="text-gray-500">ชื่อบัญชี</span>
                  <span className="font-semibold text-gray-700">น.ส. ธนธรณ์ วณิชเพิ่มทรัพย์</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">พร้อมเพย์</span>
                  <span className="font-semibold text-gray-700">สแกน QR Code ด้านบน</span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Upload Form */}
            <div className="flex flex-col gap-8 stagger">
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-100 pb-3">สรุปการจอง</h2>
                <div className="flex flex-col gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">คลาสเรียน</div>
                    <div className="font-semibold text-base">{booking.classEvent.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">วันที่ / เวลา</div>
                    <div className="font-semibold">
                      {booking.classEvent.date.toLocaleDateString("th-TH", { month: "long", day: "numeric" })} · {booking.classEvent.startTime} - {booking.classEvent.endTime}
                    </div>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100 mt-1">
                    <span className="text-gray-500">จำนวนที่นั่ง</span>
                    <span className="font-semibold">{booking.seats} ที่</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  ส่งหลักฐานการโอนเงิน
                </h2>
                <SlipUploadForm id={booking.id} type="booking" action={uploadSlip} />
              </div>

            </div>
          </div>
        )}
      </section>
    </div>
  );
}
