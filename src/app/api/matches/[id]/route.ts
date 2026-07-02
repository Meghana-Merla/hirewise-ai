import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { recruiterStatus, recruiterNotes } = body;

    const updateData: any = {};
    if (recruiterStatus !== undefined) {
      const validStatuses = ["PENDING", "SHORTLISTED", "REJECTED"];
      if (!validStatuses.includes(recruiterStatus)) {
        return NextResponse.json(
          { message: "Invalid recruiter status" },
          { status: 400 }
        );
      }
      updateData.recruiterStatus = recruiterStatus;
    }

    if (recruiterNotes !== undefined) {
      updateData.recruiterNotes = recruiterNotes;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Either recruiterStatus or recruiterNotes must be provided" },
        { status: 400 }
      );
    }

    const updated = await prisma.match.update({
      where: { id },
      data: updateData,
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
