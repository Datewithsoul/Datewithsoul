import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Check, Heart, Globe, Calendar, Clock, User, Share, Share2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ShareButton from "@/components/share-button";
import ScheduleSelector from "./schedule-selector";
import Navbar from "@/components/navbar";
import AddToCartButton from "@/components/add-to-cart-button";
import { ClassEvent } from "@/app/generated/prisma";

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classId },
    include: {
      media: {
        orderBy: { order: 'asc' }
      },
      bookings: {
        where: {
          status: { not: "CANCELLED" }
        }
      }
    }
  });

  if (!classEvent) {
    notFound();
  }

  const currentBookedSeats = classEvent.bookings.reduce((sum, b) => sum + b.seats, 0);
  const currentMaxSeats = classEvent.totalSeats + currentBookedSeats;

  // Fetch all class events with the same name (upcoming) to populate the dropdown
  const now = new Date();
  const relatedClassEventsData = await prisma.classEvent.findMany({
    where: { 
      name: classEvent.name,
      date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } // from today onwards
    },
    include: {
      bookings: {
        where: {
          status: { not: "CANCELLED" }
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });

  const relatedClassEvents = relatedClassEventsData.map(ce => {
    const bookedSeats = ce.bookings.reduce((sum, b) => sum + b.seats, 0);
    return {
      id: ce.id,
      date: ce.date,
      endDate: ce.endDate,
      startTime: ce.startTime,
      endTime: ce.endTime,
      totalSeats: ce.totalSeats,
      maxSeats: ce.totalSeats + bookedSeats
    };
  });

  return (
    <main className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <div className="max-w-[1180px] mx-auto px-6 mt-6 mb-8 relative">
        
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#222222]">
            {classEvent.name}
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-[#222222] font-semibold gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                <span>
                  {classEvent.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  {classEvent.endDate && classEvent.endDate.getTime() !== classEvent.date.getTime() && (
                    <> - {classEvent.endDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</>
                  )}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                <span>{classEvent.startTime} - {classEvent.endTime}</span>
              </span>
              <span className="underline cursor-pointer">{classEvent.category || "เวิร์กชอป"}</span>
            </div>
            
            <div className="flex gap-4">
              <ShareButton title={classEvent.name} />
            </div>
          </div>
        </div>

        {/* Large Media Gallery / Carousel */}
        <div className="w-full aspect-video md:aspect-[2/1] rounded-2xl overflow-hidden mb-12 bg-gray-100 relative group">
          {classEvent.media && classEvent.media.length > 0 ? (
            <Carousel opts={{ align: "start", loop: true }} className="w-full h-full">
              <CarouselContent className="h-full">
                {classEvent.media.map((m) => (
                  <CarouselItem key={m.id} className="h-full pl-0 basis-full">
                    <div className="h-full w-full bg-gray-900 flex items-center justify-center">
                      {m.type === "VIDEO" ? (
                        <video 
                          src={m.url} 
                          className="w-full h-full object-contain"
                          controls 
                        />
                      ) : (
                        <img 
                          src={m.url} 
                          alt={classEvent.name}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {classEvent.media.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-white/80 hover:bg-white shadow-md border-none h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                  <CarouselNext className="right-4 bg-white/80 hover:bg-white shadow-md border-none h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
              <PlayCircle size={48} className="mb-2" />
              <span className="font-bold">ไม่มีรูปภาพประกอบ</span>
            </div>
          )}
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column (Details) */}
          <div className="lg:w-2/3">
            
            <div className="pb-8 border-b border-gray-200 mb-8">
              <p className="text-gray-600 text-lg font-medium">รับสมัครสูงสุด {currentMaxSeats} ที่นั่ง · รวมอุปกรณ์พื้นฐานแล้ว</p>
            </div>
            
            {/* Description */}
            <div className="pb-8 border-b border-gray-200 mb-8">
              <div className="prose prose-sm md:prose-base max-w-none text-[#222222]">
                <p className="whitespace-pre-wrap leading-relaxed">{classEvent.description || "ไม่มีรายละเอียด"}</p>
              </div>
            </div>
            
            {/* What you'll learn */}
            {classEvent.learningOutcomes && classEvent.learningOutcomes.length > 0 && (
              <div className="pb-8 border-b border-gray-200 mb-8">
                <h2 className="text-2xl font-semibold mb-6">สิ่งที่คุณจะได้เรียนรู้</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-[#222222]">
                  {classEvent.learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <Check size={24} className="text-[#222222] shrink-0" />
                      <span className="leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Requirements */}
            {classEvent.requirements && classEvent.requirements.length > 0 && (
              <div className="pb-8 mb-8">
                <h2 className="text-2xl font-semibold mb-6">ข้อกำหนดในการเข้าเรียน</h2>
                <ul className="list-disc pl-5 space-y-3 text-[#222222]">
                  {classEvent.requirements.map((req, idx) => (
                    <li key={idx} className="leading-relaxed pl-2">{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
          
          {/* Right Column (Floating Booking Card) */}
          <div className="lg:w-1/3 relative">
            <div className="bg-white border border-gray-300 rounded-2xl shadow-xl sticky top-28 p-6 flex flex-col">
              <div className="mb-6 flex items-end gap-1">
                <span className="text-2xl font-bold">฿{classEvent.price.toLocaleString()}</span>
                <span className="text-gray-500 text-sm mb-1">/ ท่าน</span>
              </div>
              
              <ScheduleSelector 
                currentId={classEvent.id}
                schedules={relatedClassEvents}
              />
              
              <div className="flex flex-col gap-3 mb-4">
                <Link href={`/book/${classEvent.id}`} className="block w-full">
                  <button className="w-full bg-[#E51D53] hover:bg-[#D70444] text-white font-bold py-3.5 rounded-lg text-lg transition-colors">
                    จองที่นั่ง
                  </button>
                </Link>
                <AddToCartButton classEvent={classEvent} />
              </div>
              <div className="flex justify-between text-gray-700 underline mb-2 text-sm">
                <span>ราคาคอร์ส</span>
                <span>฿{classEvent.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700 underline mb-4 text-sm pb-4 border-b border-gray-200">
                <span>ค่าธรรมเนียมบริการ</span>
                <span>฿0</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>ยอดรวม</span>
                <span>฿{classEvent.price.toLocaleString()}</span>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
