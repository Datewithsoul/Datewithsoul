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

  const existingImageUrl = formData.get("existingImageUrl") as string;
  const existingVideoUrl = formData.get("existingVideoUrl") as string;

  const imageFile = formData.get("imageFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  let imageUrl = existingImageUrl || null;
  let videoUrl = existingVideoUrl || null;

  const timestamp = Date.now();

  if (imageFile && imageFile.size > 0) {
    const path = `classes/images/${timestamp}-${imageFile.name}`;
    imageUrl = await uploadMedia(imageFile, path);
  }

  if (videoFile && videoFile.size > 0) {
    const path = `classes/videos/${timestamp}-${videoFile.name}`;
    videoUrl = await uploadMedia(videoFile, path);
  }

  await prisma.classEvent.update({
    where: { id },
    data: {
      name,
      description,
      instructor,
      imageUrl,
      videoUrl,
      date,
      startTime,
      endTime,
      price,
      totalSeats,
    },
  });

  redirect("/admin/classes");
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
