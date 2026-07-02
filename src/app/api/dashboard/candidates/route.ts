import { NextResponse } from "next/server";
import { getTopCandidates } from "@/services/candidate-dashboard.service";

export async function GET() {
  try {
    const candidates = await getTopCandidates();

    return NextResponse.json(candidates, {
      status: 200,
    });
  } catch (error) {
    console.error("Dashboard Candidates Error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch top candidates",
      },
      {
        status: 500,
      }
    );
  }
}
