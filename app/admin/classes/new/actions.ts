"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createClass(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string) || "เวิร์กชอป";
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

  const schedulesJson = formData.get("schedulesJson") as string;
  let schedules: { date: string, endDate: string, startTime: string, endTime: string, totalSeats: string }[] = [];
  try {
    if (schedulesJson) {
      schedules = JSON.parse(schedulesJson);
    }
  } catch (e) {
    console.error("Failed to parse schedules JSON", e);
  }

  // Create a record for each schedule
  for (const schedule of schedules) {
    if (!schedule.date) continue; // Skip empty schedules
    
    await prisma.classEvent.create({
      data: {
        name,
        description,
        category,
        instructor: "ไม่ระบุผู้สอน", // Use default since we removed the field
        date: new Date(schedule.date),
        endDate: schedule.endDate ? new Date(schedule.endDate) : null,
        startTime: schedule.startTime || "00:00",
        endTime: schedule.endTime || "00:00",
        price,
        totalSeats: parseInt(schedule.totalSeats || "10", 10),
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
  }

  redirect("/admin/classes");
}
