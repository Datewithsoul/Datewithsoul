import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ClassEventStatus } from "@/app/generated/prisma";
import Navbar from "@/components/navbar";
import { noIndexMetadata } from "@/lib/seo";
import { AddToCartRedirect } from "./add-to-cart-redirect";

export const metadata = { title: "จองคลาส", ...noIndexMetadata };

/** Legacy "book now" URL: all bookings now go through the cart checkout. */
export default async function BookClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;

  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classId },
    include: { media: { where: { type: "IMAGE" }, orderBy: { order: "asc" }, take: 1 } },
  });

  if (!classEvent) notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = (classEvent.endDate ?? classEvent.date) < today;
  const isBookable = classEvent.status === ClassEventStatus.PUBLISHED && !isPast && classEvent.totalSeats > 0;

  // The class page explains why a round can't be booked and offers other rounds
  if (!isBookable) redirect(`/classes/${classEvent.id}`);

  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />
      <AddToCartRedirect
        item={{
          classEventId: classEvent.id,
          className: classEvent.name,
          date: classEvent.date,
          startTime: classEvent.startTime,
          endTime: classEvent.endTime,
          price: classEvent.price,
          seats: 1,
          maxSeats: classEvent.totalSeats,
          mediaUrl: classEvent.media[0]?.url,
        }}
      />
    </div>
  );
}
