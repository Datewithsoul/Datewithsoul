import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlayCircle, Check, Heart, Globe, Calendar, Clock, User, Share, Share2, MapPin, Users, BookOpen, AlertCircle } from "lucide-react";
import ShareButton from "@/components/share-button";
import ScheduleSelector from "./schedule-selector";
import Navbar from "@/components/navbar";
import AddToCartButton from "@/components/add-to-cart-button";
import MediaGallery from "@/components/media-gallery";
import { ClassEvent } from "@/app/generated/prisma";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app";

function cleanDescription(value: string | null, fallback: string) {
  const description = value?.replace(/\s+/g, " ").trim();
  if (!description) return fallback;
  return description.length > 160 ? `${description.slice(0, 157)}...` : description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      media: {
        where: { type: "IMAGE" },
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!classEvent) return {};

  const description = cleanDescription(
    classEvent.description,
    "ดูรายละเอียดและจองคลาสกับ Date with Soul Love"
  );
  const imageUrl = classEvent.media[0]?.url || `${siteUrl}/logo.jpg`;
  const pageUrl = `${siteUrl}/classes/${id}`;

  return {
    title: `${classEvent.name} | Date with Soul Love`,
    description,
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: pageUrl,
      siteName: "Date with Soul Love",
      title: classEvent.name,
      description,
      images: [{ url: imageUrl, alt: classEvent.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: classEvent.name,
      description,
      images: [imageUrl],
    },
  };
}

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
      OR: [
        { date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
        { id: classEvent.id }
      ]
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
              {classEvent.locationName && (
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {classEvent.googleMapUrl ? (
                    <a href={classEvent.googleMapUrl} target="_blank" rel="noreferrer" className="underline hover:text-[#8a6d1f]">
                      {classEvent.locationName}
                    </a>
                  ) : (
                    <span>{classEvent.locationName}</span>
                  )}
                </span>
              )}
              <span className="underline cursor-pointer">{classEvent.category || "เวิร์กชอป"}</span>
            </div>
            
            <div className="flex gap-4">
              <ShareButton title={classEvent.name} />
            </div>
          </div>
        </div>

        <MediaGallery media={classEvent.media} classNameTitle={classEvent.name} />

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column (Details) */}
          <div className="lg:w-2/3">
            
            <div className="pb-8 border-b border-gray-200 mb-8">
              <h2 className="text-2xl font-semibold mb-2">{classEvent.name}</h2>
              <p className="text-gray-600 text-lg font-medium">รับสมัครสูงสุด {currentMaxSeats} ที่นั่ง · รวมอุปกรณ์พื้นฐานแล้ว</p>
            </div>
            
            {/* Description */}
            <div className="pb-8 border-b border-gray-200 mb-8">
              <div className="prose prose-sm md:prose-base max-w-none text-[#222222]">
                <p className="whitespace-pre-wrap leading-relaxed">{classEvent.description || "ไม่มีรายละเอียด"}</p>
              </div>
            </div>

            {/* Location */}
            {(classEvent.locationName || classEvent.googleMapUrl) && (
              <div className="pb-8 border-b border-gray-200 mb-8">
                <h2 className="text-2xl font-semibold mb-5">สถานที่จัดคลาส</h2>
                <div className="flex items-center gap-4 rounded-2xl border border-[#eadfca] bg-[#fff9e8] p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E51D53] text-white shadow-sm">
                    <MapPin size={27} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-[#3d3229]">
                      {classEvent.locationName || "สถานที่จัดคลาส"}
                    </p>
                    {classEvent.googleMapUrl && (
                      <a
                        href={classEvent.googleMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block font-semibold text-[#E51D53] underline underline-offset-4 hover:text-[#b9143f]"
                      >
                        เปิดลิงก์ Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                {classEvent.status === "COMPLETED" ? (
                  <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3.5 rounded-lg text-lg cursor-not-allowed">
                    คอร์สนี้ปิดรับสมัครแล้ว
                  </button>
                ) : classEvent.totalSeats <= 0 ? (
                  <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3.5 rounded-lg text-lg cursor-not-allowed">
                    ที่นั่งเต็มแล้ว
                  </button>
                ) : (
                  <>
                    <Link href={`/book/${classEvent.id}`} className="block w-full">
                      <button className="w-full bg-[#E51D53] hover:bg-[#D70444] text-white font-bold py-3.5 rounded-lg text-lg transition-colors">
                        จองที่นั่ง
                      </button>
                    </Link>
                    <AddToCartButton classEvent={classEvent} />
                  </>
                )}
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
