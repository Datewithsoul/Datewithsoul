const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const triggers = await prisma.$queryRaw`SELECT trigger_name, action_statement FROM information_schema.triggers WHERE event_object_schema = 'auth' AND event_object_table = 'users'`;
  console.log("TRIGGERS:", triggers);
}

main().finally(() => prisma.$disconnect());
