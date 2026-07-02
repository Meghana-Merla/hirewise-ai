import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MatchingService } from "@/services/matching.service";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(jobs, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Jobs Error:", error);
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      department,
      rawDescription,
      experienceYears,
      educationLevel,
      seniority,
      domain,
      userId,
    } = body;

    if (!rawDescription || rawDescription.length < 20) {
      return NextResponse.json(
        { message: "Job description must be at least 20 characters long." },
        { status: 400 }
      );
    }

    // Ensure a valid user ID
    let finalUserId = userId;
    if (!finalUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) {
        const newUser = await prisma.user.create({
          data: {
            email: "recruiter@hirewise.ai",
            passwordHash: "placeholder_password_hash",
            name: "Default Recruiter",
            role: "recruiter",
          },
        });
        finalUserId = newUser.id;
      } else {
        finalUserId = defaultUser.id;
      }
    }

    // Call matching service to parse, generate embedding, and create Job
    const job = await MatchingService.createJobDescription(finalUserId, rawDescription, {
      title,
      company,
      department,
    });

    // Update with manual form overrides if they were specified
    const updateData: any = {};
    if (experienceYears !== undefined) updateData.experienceYears = Number(experienceYears);
    if (educationLevel !== undefined) updateData.educationLevel = educationLevel;
    if (seniority !== undefined) updateData.seniority = seniority;
    if (domain !== undefined) updateData.domain = domain;

    let updatedJob = job;
    if (Object.keys(updateData).length > 0) {
      updatedJob = await prisma.job.update({
        where: { id: job.id },
        data: updateData,
      });
    }

    return NextResponse.json(updatedJob, { status: 201 });
  } catch (error: any) {
    console.error("Create Job Error:", error);
    return NextResponse.json({ message: error.message || "Failed to create job" }, { status: 500 });
  }
}
