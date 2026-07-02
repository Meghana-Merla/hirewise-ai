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

  console.log(`Found ${candidates.length} candidates.`);
  for (const c of candidates) {
    console.log(`\nCandidate: ${c.name} (ID: ${c.id}, candidateId: ${c.candidateId})`);
    console.log(`Matches Count: ${c.matches.length}`);
    for (const m of c.matches) {
      console.log(` - Job: ${m.job?.title} (ID: ${m.jobId})`);
      console.log(`   Match ID: ${m.id}`);
      console.log(`   overallScore: ${m.overallScore}`);
      console.log(`   semanticSimilarity: ${m.semanticSimilarity}`);
      console.log(`   skillMatchScore: ${m.skillMatchScore}`);
      console.log(`   experienceScore: ${m.experienceScore}`);
      console.log(`   educationScore: ${m.educationScore}`);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
