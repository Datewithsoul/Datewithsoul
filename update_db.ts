import { prisma } from "./lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "status" = 'PENDING_PAYMENT' WHERE "status" = 'BOOKING'`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "status" = 'PENDING_PAYMENT' WHERE "status" = 'AWAITING_PAYMENT'`);
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "status" = 'CONFIRMED' WHERE "status" = 'PAID'`);
  
  await prisma.$executeRawUnsafe(`UPDATE "BookingGroup" SET "status" = 'PENDING_PAYMENT' WHERE "status" = 'PENDING'`);
  await prisma.$executeRawUnsafe(`UPDATE "BookingGroup" SET "status" = 'PENDING_PAYMENT' WHERE "status" = 'AWAITING_PAYMENT'`);
  await prisma.$executeRawUnsafe(`UPDATE "BookingGroup" SET "status" = 'CONFIRMED' WHERE "status" = 'PAID'`);

  await prisma.$executeRawUnsafe(`UPDATE "Payment" SET "status" = 'UNPAID' WHERE "status" = 'PENDING'`);
  console.log("Updated rows.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
