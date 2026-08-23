import { prisma } from "@/lib/prisma";
import { BookingStatus, ClassEventStatus } from "@/app/generated/prisma";
import Link from "next/link";
import { Calendar } from "lucide-react";
import ClassCarousel from "@/components/class-carousel";
import Navbar from "@/components/navbar";

export default async function ClassesPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dateFilter: any = { gte: today };
  let title = "คลาสเรียนและเวิร์กชอป";
  let subtitle = "ค้นหาแรงบันดาลใจและสร้างสรรค์ผลงานศิลปะในแบบของคุณ";

  if (searchParams?.date) {
    const d = new Date(searchParams.date);
    if (!isNaN(d.getTime())) {
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      dateFilter = {
        gte: d,
        lt: nextDay
      };
      title = `รายการสอนวันที่ ${d.toLocaleDateString("th-TH")}`;
      subtitle = "";
    }
  }

  const rawUpcomingClasses = await prisma.classEvent.findMany({
    where: { date: dateFilter, status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] } },
    orderBy: { date: "asc" },
    include: {
      media: {
        orderBy: { order: 'asc' }
      },
      bookings: {
        where: {
          status: { notIn: [BookingStatus.CANCELLED] }
        },
        select: { seats: true }
      }
    }
  });

  // Group by name so we only show one card per class name
  const seenNames = new Set();
  const upcomingClasses = [];
  for (const c of rawUpcomingClasses) {
    if (!seenNames.has(c.name)) {
      seenNames.add(c.name);
      upcomingClasses.push(c);
    }
  }

  return (
    <div className="min-h-screen bg-white text-brand-brown font-sans pb-24 halftone-bg">
      <Navbar />

      <section className="pt-12 pb-6 px-6 max-w-[1280px] mx-auto">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-16">
          {upcomingClasses.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xl font-medium text-gray-500">ยังไม่มีคลาสเรียนที่จัดตารางไว้ในขณะนี้</p>
            </div>
          ) : (
            Object.entries(
              upcomingClasses.reduce((acc, c) => {
                const cat = c.category || "เวิร์กชอป";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(c);
                return acc;
              }, {} as Record<string, typeof upcomingClasses>)
            ).map(([category, classes]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {classes.map((c) => {
                    const bookedSeats = c.bookings.reduce((sum, b) => sum + b.seats, 0);
                    const totalCapacity = c.totalSeats + bookedSeats;

                    return (
                      <div key={c.id} className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-gray-100">
                        {/* Image Section */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          {c.media && c.media.length > 0 ? (
                            <ClassCarousel classId={c.id} classNameTitle={c.name} media={c.media} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                              ไม่มีรูปภาพ
                            </div>
                          )}
                        </div>

                        {/* Details Section */}
                        <Link href={`/classes/${c.id}`} className="flex flex-col flex-1 p-5">
                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {c.status === "COMPLETED" ? (
                              <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                                ปิดรับสมัคร
                              </span>
                            ) : c.totalSeats > 0 ? (
                              <span className="bg-green-50 text-green-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-green-200">
                                เปิดรับสมัคร
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-gray-200">
                                เต็มแล้ว
                              </span>
                            )}
                            <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                              {c.category || "เวิร์กชอป"}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-lg leading-snug text-gray-900 mb-1.5 line-clamp-2">
                            {c.name}
                          </h3>
                          
                          {/* Subtitle / Instructor */}
                          {c.instructor && c.instructor !== "ไม่ระบุผู้สอน" && (
                            <p className="text-gray-500 text-sm mb-4">
                              ผู้สอน: {c.instructor}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                            <div className="flex justify-between items-start text-sm">
                              <div className="flex items-start gap-1.5">
                                <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">
                                    {c.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                                    {c.endDate && c.endDate.getTime() !== c.date.getTime() && (
                                      <> - {c.endDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</>
                                    )}
                                  </span>
                                  <span className="text-xs text-gray-500 mt-0.5">
                                    {c.startTime} - {c.endTime}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                 <span className={c.totalSeats > 0 ? "text-green-600 font-medium text-[11px] bg-green-50 px-2 py-0.5 rounded border border-green-100" : "text-gray-500 font-medium text-[11px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200"}>
                                   จองแล้ว {bookedSeats}/{totalCapacity}
                                 </span>
                              </div>
                            </div>
                            
                            <div className="font-bold text-xl text-gray-900 mt-1">
                              ฿{c.price.toLocaleString()}
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
