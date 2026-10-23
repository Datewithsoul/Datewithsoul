import { prisma } from "@/lib/prisma";

/**
 * Ensure the PAUSED enum value exists in the database (added after the
 * initial schema). Call before writing a ClassEvent status that may be PAUSED.
 */
let isPausedStatusChecked = false;
export async function ensurePausedClassStatus() {
  if (isPausedStatusChecked) return;
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "ClassEventStatus" ADD VALUE IF NOT EXISTS 'PAUSED'`);
    isPausedStatusChecked = true;
  } catch (error) {
    console.warn("Could not ensure PAUSED ClassEventStatus:", error);
  }
}
