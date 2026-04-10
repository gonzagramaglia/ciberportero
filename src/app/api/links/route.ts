import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const links = await db.link.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
