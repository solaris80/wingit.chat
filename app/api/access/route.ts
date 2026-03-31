import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("New Access Request:", body);

  return NextResponse.json({ success: true });
}