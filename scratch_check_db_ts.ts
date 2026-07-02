import { PrismaClient } from "@prisma/client";
import { AnomalyService } from "./src/services/anomaly.service";
import { RankingService } from "./src/services/ranking.service";

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

  console.log("Candidate Name:", candidate.name);
  console.log("Stated YOE:", candidate.yearsOfExperience);

  const candScoringInput = {
    yearsOfExperience: candidate.yearsOfExperience,
    skills: candidate.skills,
    careerHistory: candidate.careerHistory.map((ch) => {
      console.log("Career Entry:", ch.company, "| Title:", ch.title, "| Duration Months:", ch.durationMonths);
      return {
        company: ch.company,
        title: ch.title,
        startDate: ch.startDate,
        endDate: ch.endDate,
        durationMonths: ch.durationMonths,
        isCurrent: ch.isCurrent,
      };
    }),
    education: candidate.education,
    noticePeriodDays: candidate.noticePeriodDays,
    openToWork: candidate.openToWork,
    lastActiveDate: candidate.lastActiveDate,
    profileCompleteness: candidate.profileCompleteness,
    connectionCount: candidate.connectionCount,
    recruiterResponseRate: candidate.recruiterResponse ?? 1.0,
  };

  const anomalyResult = AnomalyService.checkCandidate(candScoringInput);
  console.log("Anomaly Check Result:", anomalyResult);

  const job = await prisma.job.findFirst({
    where: { id: "c1bccf04-709d-4e7a-a1e9-ed5669ac077f" }
  });
  if (!job) {
    console.log("Job not found!");
    return;
  }

  const jobScoringInput = {
    experienceYears: job.experienceYears,
    requiredSkills: job.requiredSkills,
    preferredSkills: job.preferredSkills,
    preferProductCompany: job.preferProductCompany,
  };

  const breakdown = RankingService.scoreCandidate(candScoringInput, jobScoringInput);
  console.log("Score Breakdown:", breakdown);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
