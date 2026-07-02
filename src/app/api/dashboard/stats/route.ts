import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";

export async function GET() {
  try {
    const stats = await getDashboardStats();

    return NextResponse.json(stats, {
      status: 200,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch dashboard statistics",
      },
      {
        status: 500,
      }
    );
  }
}