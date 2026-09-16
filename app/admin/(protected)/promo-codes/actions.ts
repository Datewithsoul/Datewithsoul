"use server";

import { prisma } from "@/lib/prisma";
import { DiscountType } from "@/app/generated/prisma";
import { revalidatePath } from "next/cache";

export async function getPromoCodes() {
  return await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { usages: true } },
    }
  });
}

export async function getPromoCode(id: string) {
  return await prisma.promoCode.findUnique({
    where: { id },
    include: {
      applicableEvents: true
    }
  });
}

export async function createPromoCode(data: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  applyToAll: boolean;
  maxUses?: number | null;
  perUserLimit: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  applicableEventIds?: string[];
}) {
  try {
    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code.toUpperCase() }
    });

    if (existing) {
      return { error: "รหัสส่วนลดนี้มีอยู่แล้ว" };
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        applyToAll: data.applyToAll,
        maxUses: data.maxUses,
        perUserLimit: data.perUserLimit,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        applicableEvents: data.applyToAll ? undefined : {
          connect: data.applicableEventIds?.map(id => ({ id })) || []
        }
      }
    });
    
    revalidatePath("/admin/promo-codes");
    return { success: true, promoId: promo.id };
  } catch (error: any) {
    console.error("Create promo code error:", error);
    return { error: error.message || "เกิดข้อผิดพลาดในการสร้างรหัสส่วนลด" };
  }
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
  try {
    await prisma.promoCode.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/promo-codes");
    return { success: true };
  } catch (error) {
    return { error: "ไม่สามารถเปลี่ยนสถานะได้" };
  }
}

export async function deletePromoCode(id: string) {
  try {
    await prisma.promoCode.delete({
      where: { id }
    });
    revalidatePath("/admin/promo-codes");
    return { success: true };
  } catch (error) {
    return { error: "ไม่สามารถลบรหัสส่วนลดได้ อาจมีผู้ใช้งานไปแล้ว" };
  }
}
