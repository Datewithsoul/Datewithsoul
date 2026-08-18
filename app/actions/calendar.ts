'use server';

import { prisma } from "@/lib/prisma";

export async function getClassesForMonth(year: number, month: number) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  try {
    const classes = await prisma.classEvent.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        media: {
          where: { type: 'IMAGE' },
          orderBy: { order: 'asc' },
          take: 1
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return { classes };
  } catch (error: any) {
    console.error("Failed to fetch classes for calendar:", error);
    return { error: "ไม่สามารถดึงข้อมูลปฏิทินได้" };
  }
}
