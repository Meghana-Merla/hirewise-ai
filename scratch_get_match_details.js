const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const match = await prisma.match.findFirst({
    where: { candidateId: "5bc09981-097b-40cb-b811-019a3aa82f4c" }
  });

  console.log(JSON.stringify(match, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
