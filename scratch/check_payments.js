const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bookingsWithoutPayment = await prisma.booking.findMany({
    where: {
      payment: null
    }
  });
  console.log('Bookings without payment:', bookingsWithoutPayment.length);
  
  if (bookingsWithoutPayment.length > 0) {
    console.log('First few:', bookingsWithoutPayment.slice(0, 3));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
