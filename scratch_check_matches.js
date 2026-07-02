const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({
    take: 5,
    include: {
      candidate: { select: { name: true } }
    }
  });

  console.log("Found matches count:", matches.length);
  for (const m of matches) {
    console.log("------------------------");
    console.log("Match ID:", m.id);
    console.log("Candidate Name:", m.candidate?.name);
    console.log("overallScore:", m.overallScore);
    console.log("semanticSimilarity:", m.semanticSimilarity);
    console.log("skillMatchScore:", m.skillMatchScore);
    console.log("experienceScore:", m.experienceScore);
    console.log("educationScore:", m.educationScore);
    console.log("domainScore:", m.domainScore);
    console.log("careerProgressionScore:", m.careerProgressionScore);
    console.log("availabilityScore:", m.availabilityScore);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
