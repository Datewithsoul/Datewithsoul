import { prisma } from "@/lib/prisma";
import { ClassEventStatus, BookingStatus } from "@/app/generated/prisma";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Calendar, Clock, Users } from "lucide-react";

export const metadata = {
  title: "ตารางเรียน | Date with Soul Love",
  description: "ดูตารางคลาสเรียนและเวิร์กชอปทั้งหมดของเรา",
};

export default async function SchedulePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const classes = await prisma.classEvent.findMany({
    where: {
      date: { gte: today },
      status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] },
    },
    orderBy: { date: "asc" },
    include: {
      media: { take: 1, orderBy: { order: "asc" } },
      bookings: {
        where: { status: { notIn: [BookingStatus.CANCELLED] } },
        select: { seats: true },
      },
    },
  });

  // Group by month
  const grouped = classes.reduce(
    (acc, c) => {
      const key = c.date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
      });
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    },
    {} as Record<string, typeof classes>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm mb-4"
            style={{
              backgroundColor: "var(--brand-yellow)",
              border: "var(--pop-outline)",
              boxShadow: "3px 3px 0 var(--brand-brown)",
              color: "var(--brand-brown)",
            }}
          >
            <Calendar className="w-4 h-4" />
            ตารางคลาสเรียน
          </div>
          <h1
            className="text-4xl md:text-5xl font-black leading-tight mb-3"
            style={{ color: "var(--brand-brown)" }}
          >
            ตารางเรียน<span style={{ color: "var(--brand-red)" }}>รายเดือน</span>
          </h1>
          <p className="text-base font-medium" style={{ color: "var(--brand-brown-mid)" }}>
            ดูคลาสที่กำลังจะมาถึงและเลือกจองที่นั่งของคุณได้เลย
          </p>
        </div>

        {/* Schedule list */}
        {Object.keys(grouped).length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ border: "var(--pop-outline)", boxShadow: "var(--pop-shadow)" }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "var(--brand-brown)" }} />
            <p className="font-bold text-lg" style={{ color: "var(--brand-brown)" }}>
              ยังไม่มีคลาสที่กำหนดการไว้ในขณะนี้
            </p>
            <p className="text-sm mt-2" style={{ color: "var(--brand-brown-mid)" }}>
              ติดตามตารางใหม่ได้ที่ LINE Official Account ของเรา
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="px-4 py-1.5 rounded-full font-black text-sm"
                    style={{ backgroundColor: "var(--brand-brown)", color: "white" }}
                  >
                    {month}
                  </div>
                  <div className="flex-1 h-px" style={{ backgroundColor: "var(--brand-brown)", opacity: 0.15 }} />
                </div>

                {/* Class list */}
                <div className="flex flex-col gap-4">
                  {items.map((c) => {
                    const bookedSeats = c.bookings.reduce((sum, b) => sum + b.seats, 0);
                    const totalSeats = c.totalSeats + bookedSeats;
                    const isFull = c.totalSeats <= 0;
                    const isCompleted = c.status === "COMPLETED";

                    return (
                      <Link key={c.id} href={`/classes/${c.id}`} className="block group">
                        <div
                          className="rounded-2xl bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-transform hover:-translate-y-0.5"
                          style={{ border: "var(--pop-outline)", boxShadow: "var(--pop-shadow)" }}
                        >
                          {/* Date block */}
                          <div
                            className="shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center"
                            style={{ backgroundColor: "var(--brand-yellow)", border: "var(--pop-outline)" }}
                          >
                            <span className="text-xl font-black leading-none" style={{ color: "var(--brand-brown)" }}>
                              {c.date.getDate()}
                            </span>
                            <span className="text-[10px] font-bold uppercase" style={{ color: "var(--brand-brown)" }}>
                              {c.date.toLocaleDateString("th-TH", { month: "short" })}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-black text-base leading-snug group-hover:underline" style={{ color: "var(--brand-brown)" }}>
                                {c.name}
                              </h3>
                              {isCompleted ? (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">ปิดรับสมัคร</span>
                              ) : isFull ? (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">เต็มแล้ว</span>
                              ) : (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">เปิดรับสมัคร</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium" style={{ color: "var(--brand-brown-mid)" }}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />{c.startTime} – {c.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />จองแล้ว {bookedSeats}/{totalSeats} ที่นั่ง
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="shrink-0 flex flex-col items-end gap-2">
                            <span className="font-black text-lg" style={{ color: "var(--brand-brown)" }}>
                              ฿{c.price.toLocaleString()}
                            </span>
                            {!isCompleted && !isFull && (
                              <span
                                className="text-xs font-bold px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: "var(--brand-red)", color: "white" }}
                              >
                                จองเลย →
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
