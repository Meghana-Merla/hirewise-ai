import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { recruiterStatus } = body;

    if (!recruiterStatus) {
      return NextResponse.json(
        { message: "recruiterStatus is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "SHORTLISTED", "REJECTED"];
    if (!validStatuses.includes(recruiterStatus)) {
      return NextResponse.json(
        { message: "Invalid recruiter status" },
        { status: 400 }
      );
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { recruiterStatus },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Update Match Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update match status" },
      { status: 500 }
    );
  }
}
