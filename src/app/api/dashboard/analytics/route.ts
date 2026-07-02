import { NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/services/dashboard.service";

export async function GET() {
  try {
    const analytics = await getDashboardAnalytics();

    return NextResponse.json(analytics, {
      status: 200,
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch dashboard analytics",
      },
      {
        status: 500,
      }
    );
  }
}
