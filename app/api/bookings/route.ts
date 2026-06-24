import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Bookings API" });
}

export async function POST() {
  return NextResponse.json({ message: "Create booking" });
}
