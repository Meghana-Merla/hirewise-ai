const { PrismaClient } = require("@prisma/client");
const { AnomalyService } = require("./.dist/services/anomaly.service");
const { RankingService } = require("./.dist/services/ranking.service");
const prisma = new PrismaClient();

async function main() {
  const candidate = await prisma.candidate.findUnique({
    where: { candidateId: "CAND_4650049" },
    include: {
      skills: true,
      careerHistory: true,
      education: true,
    }
  });

  if (!candidate) {
    console.log("Candidate not found!");
    return;
  }

  console.log("Candidate details:", candidate.name);
  console.log("Stated YOE:", candidate.yearsOfExperience);

  const candScoringInput = {
    yearsOfExperience: candidate.yearsOfExperience,
    skills: candidate.skills,
    careerHistory: candidate.careerHistory.map((ch) => ({
      company: ch.company,
      title: ch.title,
      startDate: ch.startDate,
      endDate: ch.endDate,
      durationMonths: ch.durationMonths,
      isCurrent: ch.isCurrent,
    })),
    education: candidate.education,
    noticePeriodDays: candidate.noticePeriodDays,
    openToWork: candidate.openToWork,
    lastActiveDate: candidate.lastActiveDate,
    profileCompleteness: candidate.profileCompleteness,
    connectionCount: candidate.connectionCount,
  };

  const anomalyResult = AnomalyService.checkCandidate(candScoringInput);
  console.log("Anomaly Check Result:", anomalyResult);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
