"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createClass(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructor = (formData.get("instructor") as string) || "ไม่ระบุผู้สอน";
  const date = new Date(formData.get("date") as string);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const price = parseFloat(formData.get("price") as string);
  const totalSeats = parseInt(formData.get("totalSeats") as string, 10);

  const category = (formData.get("category") as string) || "เวิร์กชอป";
  const endDateStr = formData.get("endDate") as string;
  const endDate = endDateStr ? new Date(endDateStr) : null;
  const learningOutcomesStr = formData.get("learningOutcomes") as string;
  const requirementsStr = formData.get("requirements") as string;
  
  const learningOutcomes = learningOutcomesStr ? learningOutcomesStr.split("\n").map(s => s.trim()).filter(Boolean) : [];
  const requirements = requirementsStr ? requirementsStr.split("\n").map(s => s.trim()).filter(Boolean) : [];

  const mediaJson = formData.get("mediaJson") as string;
  let mediaItems: { url: string, type: string, order: number }[] = [];
  
  try {
    if (mediaJson) {
      mediaItems = JSON.parse(mediaJson);
    }
  } catch (e) {
    console.error("Failed to parse media JSON", e);
  }

  await prisma.classEvent.create({
    data: {
      name,
      description,
      category,
      instructor,
      date,
      endDate,
      startTime,
      endTime,
      price,
      totalSeats,
      learningOutcomes,
      requirements,
      media: {
        create: mediaItems.map(m => ({
          url: m.url,
          type: m.type,
          order: m.order
        }))
      }
    },
  });

  redirect("/admin/classes");
}
