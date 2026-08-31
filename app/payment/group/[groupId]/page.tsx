import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PaymentTimer from "@/components/payment-timer";
import { createClient } from "@/utils/supabase/server";
import { Upload } from "lucide-react";
import { uploadGroupSlip } from "./actions";
import { BookingGroupStatus } from "@/app/generated/prisma";
import { sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";

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
  const expiryTime = new Date(bookingGroup.createdAt.getTime() + 10 * 60 * 1000);
  const isExpired = now > expiryTime;

  if (!isExpired && bookingGroup.status === "PENDING_PAYMENT") {
  }

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
          <h1 className="text-3xl font-bold tracking-tight mb-2">ชำระเงิน (รายการกลุ่ม)</h1>
          <p className="text-gray-500">รหัสการจอง: {bookingGroup.id.split('-')[0].toUpperCase()}</p>
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
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-red-500 mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">หมดเวลาชำระเงิน</h2>
            <p className="text-gray-600 mb-8">รายการจองนี้ถูกยกเลิกแล้ว เนื่องจากเกินเวลาที่กำหนด (10 นาที)</p>
            <Link href="/classes">
              <button className="bg-[#222222] hover:bg-black text-white px-8 py-3.5 rounded-full font-bold transition-colors">
                กลับไปหน้าคลาสเรียน
              </button>
            </Link>
          </div>
        ) : (bookingGroup.status === BookingGroupStatus.PAYMENT_REVIEW || bookingGroup.status === BookingGroupStatus.CONFIRMED) ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-green-500 mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {bookingGroup.status === BookingGroupStatus.CONFIRMED ? "ชำระเงินสำเร็จ" : "กำลังตรวจสอบการชำระเงิน"}
            </h2>
            <p className="text-gray-600 mb-8">
              {bookingGroup.status === BookingGroupStatus.CONFIRMED 
                ? "เราได้รับการชำระเงินของคุณแล้ว ขอบคุณที่จองคลาสกับเรา!" 
                : "เราได้รับหลักฐานการโอนเงินของคุณแล้ว ทีมงานจะทำการตรวจสอบภายใน 24 ชั่วโมง"}
            </p>
            <Link href="/bookings">
              <button className="bg-[#222222] hover:bg-black text-white px-8 py-3.5 rounded-full font-bold transition-colors">
                ดูประวัติการจองทั้งหมด
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Left: Summary */}
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-6 relative overflow-hidden">
                 <PaymentTimer createdAt={bookingGroup.createdAt.toISOString()} groupId={bookingGroup.id} />
                
                <h2 className="text-xl font-bold mb-4 mt-6">สรุปรายการจอง</h2>
                <div className="flex flex-col gap-4 mb-6">
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
                  <h2 className="text-lg font-semibold mb-2">สแกนจ่ายผ่านพร้อมเพย์</h2>
                  <div className="bg-[#113566] text-white px-3 py-1 rounded-md font-semibold text-xs mb-6 w-max">
                    PromptPay
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 w-64 h-64 flex items-center justify-center mb-6 shadow-sm">
                    <img src="/qrcode.jpg" alt="PromptPay QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 font-medium">
                    ยอดชำระ: ฿{bookingGroup.totalPrice.toLocaleString()}
                  </div>
                </div>

                <form action={uploadGroupSlip} className="flex flex-col gap-4">
                  <input type="hidden" name="groupId" value={bookingGroup.id} />
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm text-gray-700">แนบสลิปโอนเงิน</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        name="slip" 
                        accept="image/*"
                        required
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg bg-white file:hidden text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer hover:bg-gray-50 transition-colors"
                      />
                      <Upload className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB</p>
                  </div>

                  <button 
                    type="submit"
                    className="mt-4 bg-[#E51D53] hover:bg-[#D70444] text-white font-bold py-3.5 rounded-lg text-lg transition-colors w-full"
                  >
                    แจ้งชำระเงิน
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
