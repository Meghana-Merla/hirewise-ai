import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    const where: any = {};
    if (jobId) {
      where.jobId = jobId;
    }

    const matches = await prisma.match.findMany({
      where,
      orderBy: { overallScore: "desc" },
      include: {
        candidate: {
          include: {
            skills: true,
          },
        },
        job: true,
      },
    });

    return NextResponse.json(matches, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Matches Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
