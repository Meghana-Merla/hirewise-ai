import { prisma } from '../lib/prisma';
import { GeminiService } from './gemini.service';
import { RankingService, CandidateScoringInput, JobScoringInput } from './ranking.service';

export class MatchingService {
  /**
   * Helper to parse PostgreSQL vector string (e.g. "[0.1,0.2,...]") into number[]
   */
  public static parseVectorString(vectorStr?: string | null): number[] {
    if (!vectorStr) return [];
    return vectorStr
      .replace(/[\[\]]/g, '')
      .split(',')
      .map(Number);
  }

  /**
   * Helper to format number[] into PostgreSQL vector string format (e.g. "[0.1,0.2,...]")
   */
  public static formatVectorString(vector?: number[] | null): string {
    if (!vector || vector.length === 0) return '[]';
    return `[${vector.join(',')}]`;
  }

  /**
   * Uploads a job description, parses it using Gemini, calculates embeddings, and saves to database.
   */
  public static async createJobDescription(
    userId: string,
    rawDescription: string,
    meta?: { title?: string; company?: string; department?: string }
  ): Promise<any> {
    // 1. Parse JD using Gemini
    const parsedJd = await GeminiService.parseJobDescription(rawDescription);

    // Override with custom metadata if provided
    const finalTitle = meta?.title || parsedJd.title || 'Untitled Role';
    const finalCompany = meta?.company || parsedJd.company || 'Unknown Company';
    const finalDept = meta?.department || parsedJd.department || 'General';

    // 2. Generate embedding for raw text
    const embedding = await GeminiService.generateEmbedding(rawDescription);

    // 3. Save to database (without vector first)
    const job = await prisma.job.create({
      data: {
        userId,
        title: finalTitle,
        company: finalCompany,
        department: finalDept,
        rawDescription,
        requiredSkills: parsedJd.requiredSkills,
        preferredSkills: parsedJd.preferredSkills,
        responsibilities: parsedJd.responsibilities,
        experienceYears: parsedJd.experienceYears,
        educationLevel: parsedJd.educationLevel,
        seniority: parsedJd.seniority,
        domain: parsedJd.domain,
        softSkills: parsedJd.softSkills,
        preferProductCompany: parsedJd.preferProductCompany,
        preferredDegrees: parsedJd.preferredDegrees,
        preferredUniversities: parsedJd.preferredUniversities,
      },
    });

    // 4. Save embedding vector using raw SQL
    const vectorStr = this.formatVectorString(embedding);
    await prisma.$executeRawUnsafe(
      `UPDATE "Job" SET "embedding" = $1::vector WHERE "id" = $2`,
      vectorStr,
      job.id
    );

    return job;
  }

  /**
   * Uploads a candidate resume text, parses using Gemini, calculates embedding, and saves candidate details.
   */
  public static async createCandidateProfile(
    userId: string,
    rawResumeText: string,
    customCandidateId?: string
  ): Promise<any> {
    // 1. Parse Resume using Gemini
    const parsedCandidate = await GeminiService.parseResume(rawResumeText);

    // 2. Generate Candidate embedding
    const embedding = await GeminiService.generateEmbedding(rawResumeText);

    // 3. Generate a unique official Candidate ID (CAND_XXXXXXX) if not provided
    const officialCandId = customCandidateId || (await this.generateUniqueCandidateId());

    // 4. Save Candidate, Career History, Education, Skills
    const candidate = await prisma.candidate.create({
      data: {
        userId,
        candidateId: officialCandId,
        name: parsedCandidate.profile.anonymizedName,
        rawResumeText,
        headline: parsedCandidate.profile.headline,
        summary: parsedCandidate.profile.summary,
        location: parsedCandidate.profile.location,
        country: parsedCandidate.profile.country,
        yearsOfExperience: parsedCandidate.profile.yearsOfExperience,
        currentTitle: parsedCandidate.profile.currentTitle,
        currentCompany: parsedCandidate.profile.currentCompany,
        currentCompanySize: parsedCandidate.profile.currentCompanySize,
        currentIndustry: parsedCandidate.profile.currentIndustry,
        // Default Redrob behavioral signal values
        profileCompleteness: 85.0,
        openToWork: true,
        noticePeriodDays: 30,
        connectionCount: 150,
        recruiterResponse: 0.85,
        avgResponseTime: 24.0,
      },
    });

    // 5. Save embedding vector
    const vectorStr = this.formatVectorString(embedding);
    await prisma.$executeRawUnsafe(
      `UPDATE "Candidate" SET "embedding" = $1::vector WHERE "id" = $2`,
      vectorStr,
      candidate.id
    );

    // 6. Save nested Skills
    if (parsedCandidate.skills && parsedCandidate.skills.length > 0) {
      await prisma.skill.createMany({
        data: parsedCandidate.skills.map((s) => ({
          candidateId: candidate.id,
          name: s.name,
          proficiency: s.proficiency,
          endorsements: s.endorsements,
          durationMonths: s.durationMonths,
        })),
      });
    }

    // 7. Save Career History
    if (parsedCandidate.careerHistory && parsedCandidate.careerHistory.length > 0) {
      await prisma.careerHistory.createMany({
        data: parsedCandidate.careerHistory.map((ch) => ({
          candidateId: candidate.id,
          company: ch.company,
          title: ch.title,
          startDate: ch.startDate ? new Date(ch.startDate) : null,
          endDate: ch.endDate ? new Date(ch.endDate) : null,
          durationMonths: ch.durationMonths,
          isCurrent: ch.isCurrent,
          industry: ch.industry,
          companySize: ch.companySize,
          description: ch.description,
        })),
      });
    }

    // 8. Save Education
    if (parsedCandidate.education && parsedCandidate.education.length > 0) {
      await prisma.education.createMany({
        data: parsedCandidate.education.map((e) => ({
          candidateId: candidate.id,
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          startYear: e.startYear,
          endYear: e.endYear,
          grade: e.grade,
          tier: e.tier,
        })),
      });
    }

    return candidate;
  }

  /**
   * Runs the matching calculations for a Job against all Candidates in the database.
   */
  public static async runJobMatching(jobId: string, customWeights?: Record<string, number>): Promise<number> {
    // 1. Fetch Job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new Error(`Job description not found for ID: ${jobId}`);
    }

    // 2. Fetch Job Embedding
    const jdEmbedResult = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "embedding"::text FROM "Job" WHERE "id" = $1`,
      jobId
    );
    const jdVector = this.parseVectorString(jdEmbedResult[0]?.embedding);

    const jobScoringInput: JobScoringInput = {
      experienceYears: job.experienceYears,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      preferProductCompany: job.preferProductCompany,
      embedding: jdVector.length > 0 ? jdVector : null,
    };

    // 3. Fetch all Candidates with full details
    const candidates = await prisma.candidate.findMany({
      include: {
        skills: true,
        careerHistory: true,
        education: true,
      },
    });

    // Fetch Candidate Embeddings map
    const candEmbedResults = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "id", "embedding"::text FROM "Candidate"`
    );
    const embeddingMap = new Map<string, number[]>();
    for (const r of candEmbedResults) {
      if (r.embedding) {
        embeddingMap.set(r.id, this.parseVectorString(r.embedding));
      }
    }

    let matchCount = 0;

    // 4. Calculate score for each candidate and save Match
    for (const candidate of candidates) {
      const candEmbedding = embeddingMap.get(candidate.id);
      const candScoringInput: CandidateScoringInput = {
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
        recruiterResponseRate: candidate.recruiterResponse,
        embedding: candEmbedding || null,
      };

      // Calculate Hybrid score
      const breakdown = RankingService.scoreCandidate(candScoringInput, jobScoringInput, customWeights);

      // Generate rule-based basic reasoning to populate initially
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      const missingSkills: string[] = [];

      const candSkillSet = new Set(candidate.skills.map((s) => s.name.toLowerCase().trim()));
      for (const reqSkill of job.requiredSkills) {
        if (!candSkillSet.has(reqSkill.toLowerCase().trim())) {
          missingSkills.push(reqSkill);
        }
      }

      if (breakdown.skillMatchScore >= 80.0) {
        strengths.push('Technical skill alignment is exceptionally strong.');
      }
      if (breakdown.experienceScore >= 90.0) {
        strengths.push(`Stated ${candidate.yearsOfExperience} YOE matches target band.`);
      }
      if (breakdown.educationScore >= 80.0) {
        strengths.push('Candidate attended a premier academic institution.');
      }

      if (candidate.noticePeriodDays >= 90) {
        weaknesses.push(`Notice period of ${candidate.noticePeriodDays} days poses transition risk.`);
      }
      if (breakdown.experienceScore < 60.0) {
        weaknesses.push('Experience falls outside the optimal range requested in the JD.');
      }
      if (missingSkills.length > 0) {
        weaknesses.push(`Missing some required skills: ${missingSkills.slice(0, 3).join(', ')}.`);
      }

      const hiringRecommendation = `Candidate ${candidate.name} exhibits an overall fit of ${breakdown.overallScore.toFixed(1)}%. Key skills are ${candidate.skills.slice(0, 3).map((s) => s.name).join(', ')}.`;

      // 5. Save/Update Match record
      await prisma.match.upsert({
        where: {
          jobId_candidateId: {
            jobId: job.id,
            candidateId: candidate.id,
          },
        },
        create: {
          jobId: job.id,
          candidateId: candidate.id,
          overallScore: breakdown.overallScore,
          semanticSimilarity: breakdown.semanticSimilarity,
          skillMatchScore: breakdown.skillMatchScore,
          experienceScore: breakdown.experienceScore,
          educationScore: breakdown.educationScore,
          domainScore: breakdown.domainScore,
          careerProgressionScore: breakdown.careerProgressionScore,
          availabilityScore: breakdown.availabilityScore,
          strengths,
          weaknesses,
          missingSkills,
          hiringRecommendation,
          improvementSuggestions: [
            'Consider highlighting missing technical projects in your resume.',
            'Connect credentials or GitHub profile to improve verification signals.',
          ],
        },
        update: {
          overallScore: breakdown.overallScore,
          semanticSimilarity: breakdown.semanticSimilarity,
          skillMatchScore: breakdown.skillMatchScore,
          experienceScore: breakdown.experienceScore,
          educationScore: breakdown.educationScore,
          domainScore: breakdown.domainScore,
          careerProgressionScore: breakdown.careerProgressionScore,
          availabilityScore: breakdown.availabilityScore,
        },
      });

      matchCount++;
    }

    return matchCount;
  }

  /**
   * Generates a unique CAND_XXXXXXX candidate ID (random 7-digit check for uniqueness)
   */
  private static async generateUniqueCandidateId(): Promise<string> {
    let attempts = 0;
    while (attempts < 10) {
      const num = Math.floor(1000000 + Math.random() * 9000000);
      const candidateId = `CAND_${num}`;
      const exists = await prisma.candidate.findUnique({
        where: { candidateId },
      });
      if (!exists) return candidateId;
      attempts++;
    }
    throw new Error('Failed to generate a unique candidate ID after 10 attempts.');
  }
}
