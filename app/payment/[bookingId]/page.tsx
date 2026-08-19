import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Upload, ArrowLeft } from "lucide-react";
import PaymentTimer from "@/components/payment-timer";
import generatePayload from "promptpay-qr";
import qrcode from "qrcode";
import { uploadSlip } from "./actions";
import { BookingStatus, PaymentStatus } from "@/app/generated/prisma";

import Navbar from "@/components/navbar";

// Default PromptPay Number (User can change this later)
const PROMPTPAY_NUMBER = "0800000000"; // Fake number for prototype

export default async function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      classEvent: true,
      payment: true,
    }
  });

  if (!booking) {
    return notFound();
  }

  // Check server-side expiration
  const now = new Date();
  const expiryTime = new Date(booking.createdAt.getTime() + 10 * 60 * 1000);
  const isExpired = now > expiryTime;

  const payableStatuses = [BookingStatus.BOOKING, BookingStatus.AWAITING_PAYMENT] as const;
  const isPayable = payableStatuses.includes(booking.status as (typeof payableStatuses)[number]);

  if (!isExpired && booking.status === BookingStatus.BOOKING) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.AWAITING_PAYMENT },
    });
    booking.status = BookingStatus.AWAITING_PAYMENT;
  }

  if (isExpired && isPayable) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await prisma.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    if (booking.payment) {
      await prisma.payment.update({
        where: { bookingId },
        data: { status: PaymentStatus.REJECTED },
      });
    }

    booking.status = BookingStatus.CANCELLED;
  }

  // Generate QR Code Data URL
  const payload = generatePayload(PROMPTPAY_NUMBER, { amount: booking.totalPrice });
  const qrDataURL = await qrcode.toDataURL(payload, { 
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    margin: 2,
    scale: 8
  });

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <section className="pt-12 px-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center border-b border-gray-200 pb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">ชำระเงิน</h1>
          <p className="text-gray-500">รหัสการจอง: {booking.id.split('-')[0].toUpperCase()}</p>
        </div>

        {booking.status === BookingStatus.CANCELLED ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-red-500 mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">หมดเวลาชำระเงิน</h2>
            <p className="text-gray-600 mb-8">รายการจองนี้ถูกยกเลิกแล้ว เนื่องจากเกินเวลาที่กำหนด (10 นาที)</p>
            <Link 
              href="/classes"
              className="inline-block bg-[#222222] hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              กลับไปดูคลาสเรียนทั้งหมด
            </Link>
          </div>
        ) : booking.status === BookingStatus.PAID ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-green-600 mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-green-800">ชำระเงินเรียบร้อยแล้ว!</h2>
            <p className="text-green-700 mb-8">แอดมินตรวจสอบสลิปและยืนยันการชำระเงินแล้ว พบกันในวันคลาสเรียนนะครับ/ค่ะ</p>
            <Link 
              href="/bookings"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              ดูประวัติการจอง
            </Link>
          </div>
        ) : booking.status === BookingStatus.PAYMENT_REVIEW ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3 text-yellow-900">การตรวจสอบชำระเงิน</h2>
            <p className="text-yellow-800 mb-8">เราได้รับสลิปของคุณแล้ว กำลังรอแอดมินตรวจสอบว่าชำระเงินจริง เมื่อยืนยันแล้วสถานะจะเป็นชำระเงินแล้ว</p>
            {booking.payment?.slipUrl ? (
              <img src={booking.payment.slipUrl} alt="สลิปที่ส่งแล้ว" className="mx-auto mb-8 max-h-64 rounded-lg border border-yellow-200" />
            ) : null}
            <Link 
              href="/bookings"
              className="inline-block bg-[#222222] hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              ดูประวัติการจอง
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column: QR Code & Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-full mb-6">
                <PaymentTimer createdAt={booking.createdAt} bookingId={booking.id} />
              </div>
              
              <h2 className="text-lg font-semibold mb-2">สแกนจ่ายผ่านพร้อมเพย์</h2>
              <div className="bg-[#113566] text-white px-3 py-1 rounded-md font-semibold text-xs mb-6">
                PromptPay
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 w-64 h-64 flex items-center justify-center mb-6 shadow-sm">
                <img src={qrDataURL} alt="PromptPay QR Code" className="w-full h-full object-contain" />
              </div>
              
              <div className="text-3xl font-bold text-[#F44336] mb-4">
                ฿{booking.totalPrice.toLocaleString()}
              </div>
              
              <div className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2 mb-2">
                  <span className="text-gray-500">ชื่อบัญชี</span>
                  <span className="font-semibold text-gray-700">Date With Soul (ทดสอบ)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">พร้อมเพย์</span>
                  <span className="font-semibold text-gray-700">{PROMPTPAY_NUMBER}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Upload Form */}
            <div className="flex flex-col gap-8">
              
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
                      {booking.classEvent.date.toLocaleDateString('th-TH', { month: 'long', day: 'numeric' })} · {booking.classEvent.startTime} - {booking.classEvent.endTime}
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
                  <Upload size={20} /> ส่งหลักฐานการโอนเงิน
                </h2>
                <form action={uploadSlip} className="flex flex-col gap-5">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="slipImage" className="font-semibold text-sm text-gray-700">อัปโหลดรูปสลิป <span className="text-red-500">*</span></label>
                    <input 
                      type="file" 
                      id="slipImage" 
                      name="slipImage" 
                      accept="image/*"
                      required
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="mt-2 bg-[#E51D53] hover:bg-[#D70444] text-white py-3 rounded-lg font-bold transition-colors"
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
