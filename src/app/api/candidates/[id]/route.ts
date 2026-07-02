import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        skills: true,
        education: true,
        careerHistory: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(candidate, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Candidate Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch candidate details" },
      { status: 500 }
    );
  }
}
