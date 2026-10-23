import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PaymentTimer from "@/components/payment-timer";
import { createClient } from "@/utils/supabase/server";
import { SlipUploadForm } from "@/components/slip-upload-form";
import { StatusHero } from "@/components/motion/status-hero";
import { BookingProgress } from "@/components/motion/booking-progress";
import { uploadGroupSlip } from "./actions";
import { BookingGroupStatus } from "@/app/generated/prisma";
import { sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";
import { getPaymentSettings } from "@/lib/payment-settings";
import { PAYMENT_WINDOW_MS } from "@/lib/expire-bookings";
import { PaymentQr, BankAccountDetails } from "@/components/payment-account-details";

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";

export default async function GroupPaymentPage({ params, searchParams }: { params: Promise<{ groupId: string }>, searchParams: Promise<{ error?: string }> }) {
  const { groupId } = await params;
  const { error } = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const bookingGroup = await prisma.bookingGroup.findUnique({
    where: { id: groupId },
    include: {
      bookings: {
        include: {
          classEvent: true
        }
      },
      payment: true,
      user: true
    }
  });

  if (!bookingGroup) {
    notFound();
  }
  if (!user) {
    redirect("/login");
  }
  if (user.id !== bookingGroup.userId) {
    redirect("/bookings");
  }

  const now = new Date();
  const expiryTime = new Date(bookingGroup.createdAt.getTime() + PAYMENT_WINDOW_MS);
  const paymentSettings = await getPaymentSettings();
  const isExpired = now > expiryTime;

  // Handle expired status
  if (isExpired && bookingGroup.status === "PENDING_PAYMENT") {
    await prisma.$transaction(async (tx) => {
      const updatedGroup = await tx.bookingGroup.updateMany({
        where: { id: groupId, status: BookingGroupStatus.PENDING_PAYMENT },
        data: { status: BookingGroupStatus.CANCELLED },
      });
      if (updatedGroup.count === 0) return;
      
      for (const booking of bookingGroup.bookings) {
        if (booking.status !== "PENDING_PAYMENT") continue;

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" }
        });
        await tx.classEvent.update({
          where: { id: booking.classEventId },
          data: { totalSeats: { increment: booking.seats } }
        });
      }

      if (bookingGroup.payment) {
        await tx.payment.update({
          where: { id: bookingGroup.payment.id },
          data: { status: "REJECTED" },
        });
      }
    });
    const className = bookingGroup.bookings.map((b) => b.classEvent.name).join(", ");
    if (bookingGroup.user.lineId) {
      await sendTemplatedLineMessage(bookingGroup.user.lineId, "BOOKING_EXPIRED_USER", {
        userName: bookingGroup.user.name,
        className,
      }, { userId: bookingGroup.userId, type: "BOOKING_EXPIRED" });
    }
    await notifyAdminsTemplated("ADMIN_BOOKING_EXPIRED", { userName: bookingGroup.user.name, className });

    bookingGroup.status = BookingGroupStatus.CANCELLED;
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <section className="pt-12 px-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 animate-fade-up">ชำระเงิน (รายการกลุ่ม)</h1>
          <p className="text-gray-500 animate-fade-up" style={{ "--delay": "80ms" } as React.CSSProperties}>
            รหัสการจอง: {bookingGroup.id.split("-")[0].toUpperCase()}
          </p>
          {bookingGroup.status !== BookingGroupStatus.CANCELLED && (
            <BookingProgress status={bookingGroup.status} className="mt-8" />
          )}
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p>{error}</p>
            <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold underline">
              ติดต่อแอดมินผ่าน LINE OA
            </a>
          </div>
        )}

        {bookingGroup.status === BookingGroupStatus.CANCELLED ? (
          <StatusHero
            variant="cancelled"
            title="หมดเวลาชำระเงิน"
            description="รายการจองนี้ถูกยกเลิกแล้ว เนื่องจากเกินเวลาที่กำหนด (10 นาที)"
          >
            <Link
              href="/classes"
              className="inline-block bg-[#222222] hover:bg-black text-white px-8 py-3.5 rounded-full font-bold transition-all hover:-translate-y-0.5"
            >
              กลับไปหน้าคลาสเรียน
            </Link>
          </StatusHero>
        ) : (bookingGroup.status === BookingGroupStatus.PAYMENT_REVIEW || bookingGroup.status === BookingGroupStatus.CONFIRMED) ? (
          <StatusHero
            variant={bookingGroup.status === BookingGroupStatus.CONFIRMED ? "success" : "review"}
            title={bookingGroup.status === BookingGroupStatus.CONFIRMED ? "ชำระเงินสำเร็จ" : "กำลังตรวจสอบการชำระเงิน"}
            description={
              bookingGroup.status === BookingGroupStatus.CONFIRMED
                ? "เราได้รับการชำระเงินของคุณแล้ว ขอบคุณที่จองคลาสกับเรา!"
                : "เราได้รับหลักฐานการโอนเงินของคุณแล้ว ทีมงานจะทำการตรวจสอบภายใน 24 ชั่วโมง"
            }
            confettiKey={bookingGroup.id}
          >
            <Link
              href="/bookings"
              className="inline-block bg-[#222222] hover:bg-black text-white px-8 py-3.5 rounded-full font-bold transition-all hover:-translate-y-0.5"
            >
              ดูประวัติการจองทั้งหมด
            </Link>
          </StatusHero>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto stagger">
            {/* Left: Summary */}
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 relative overflow-hidden">
                 <PaymentTimer createdAt={bookingGroup.createdAt.toISOString()} groupId={bookingGroup.id} />
                
                <h2 className="text-xl font-bold mb-4 mt-6">สรุปรายการจอง</h2>
                <div className="flex flex-col gap-4 mb-6 stagger">
                  {bookingGroup.bookings.map((b) => (
                    <div key={b.id} className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold text-gray-900">{b.classEvent.name}</h3>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>{b.seats} ที่นั่ง</span>
                        <span>฿{b.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between font-bold text-xl pt-2">
                  <span>ยอดรวมทั้งสิ้น</span>
                  <span className="text-[#F44336]">฿{bookingGroup.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right: Payment details */}
            <div>
              <div className="bg-white border-[1.5px] border-[var(--brand-brown)] rounded-2xl p-8" style={{ boxShadow: "3px 3px 0 var(--brand-brown)" }}>
                <h2 className="text-xl font-bold mb-6">ช่องทางการชำระเงิน</h2>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-center border border-gray-200 flex flex-col items-center">
                  <PaymentQr qrImageUrl={paymentSettings.qrImageUrl} />
                  <div className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 font-medium mb-4">
                    ยอดชำระ: ฿{bookingGroup.totalPrice.toLocaleString()}
                  </div>
                  <BankAccountDetails settings={paymentSettings} />
                </div>

                <div className="mt-4">
                  <SlipUploadForm id={bookingGroup.id} type="group" action={uploadGroupSlip} />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
