"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { uploadMedia } from "@/utils/supabase/storage";

export async function updateClass(formData: FormData) {
  const id = formData.get("id") as string;
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

  // Delete all existing media for this class
  await prisma.classMedia.deleteMany({
    where: { classEventId: id }
  });

  await prisma.classEvent.update({
    where: { id },
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

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;
  
  if (!file || !path) {
    throw new Error("Missing file or path");
  }

  const url = await uploadMedia(file, path);
  return url;
}

export async function deleteClass(formData: FormData) {
  const id = formData.get("id") as string;
  
  // Note: We might want to check if there are active bookings before deleting.
  // For now, we will simply delete the class (it might fail if there are foreign key constraints, 
  // so normally we'd delete bookings first or mark as cancelled).
  
  await prisma.classEvent.delete({
    where: { id }
  });

  redirect("/admin/classes");
}
