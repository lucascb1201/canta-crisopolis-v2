import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const data = await request.json();

    const { firstName, lastName, phone, email, address, city, state, zipCode } =
      data;

    if (!firstName || !lastName || !phone || !email || !address) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const candidate = await Candidate.create({
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully",
        candidate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Candidate registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
