"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { uploadMedia } from "@/utils/supabase/storage";

export async function createClass(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const instructor = (formData.get("instructor") as string) || "ไม่ระบุผู้สอน";
  const date = new Date(formData.get("date") as string);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const price = parseFloat(formData.get("price") as string);
  const totalSeats = parseInt(formData.get("totalSeats") as string, 10);

  const imageFile = formData.get("imageFile") as File | null;
  const videoFile = formData.get("videoFile") as File | null;

  let imageUrl: string | null = null;
  let videoUrl: string | null = null;

  const timestamp = Date.now();

  if (imageFile && imageFile.size > 0) {
    const path = `classes/images/${timestamp}-${imageFile.name}`;
    imageUrl = await uploadMedia(imageFile, path);
  }

  if (videoFile && videoFile.size > 0) {
    const path = `classes/videos/${timestamp}-${videoFile.name}`;
    videoUrl = await uploadMedia(videoFile, path);
  }

  await prisma.classEvent.create({
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
