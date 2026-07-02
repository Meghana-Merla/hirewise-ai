const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.candidate.findMany({
    include: {
      matches: {
        include: {
          job: true
        }
      }
    }
  });

  for (const candidate of candidates) {
    console.log(`\n=== Flow Investigation for Candidate: ${candidate.name} ===`);
    const match = candidate.matches[0];
    if (!match) {
      console.log("No match found.");
      continue;
    }
    console.log("1. Match.overallScore from database:", match.overallScore);
    
    // API returns the candidate object directly
    const apiMatch = match;
    console.log("2. overallScore returned by the API:", apiMatch.overallScore);

    // React state
    const activeMatch = apiMatch;
    console.log("3. activeMatch.overallScore inside React:", activeMatch.overallScore);

    // Badge rendering
    const badgeValue = (activeMatch.overallScore * 100).toFixed(0);
    console.log("4. The value used to render the badge:", badgeValue + "% Match");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
