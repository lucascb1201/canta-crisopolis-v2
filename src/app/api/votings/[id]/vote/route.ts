import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voting from "@/models/Voting";
import Vote from "@/models/Vote";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { optionId, deviceFingerprint } = await request.json();

    if (!optionId || !deviceFingerprint) {
      return NextResponse.json(
        { error: "Option ID and device fingerprint are required" },
        { status: 400 }
      );
    }

    // Check if voting exists and is open
    const voting = await Voting.findById(params.id);

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    if (voting.isClosed) {
      return NextResponse.json(
        { error: "This voting is closed" },
        { status: 400 }
      );
    }

    // Check if this device already voted
    const existingVote = await Vote.findOne({
      votingId: params.id,
      deviceFingerprint,
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted in this poll" },
        { status: 400 }
      );
    }

    // Get IP and User Agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create vote record
    await Vote.create({
      votingId: params.id,
      optionId,
      deviceFingerprint,
      ipAddress,
      userAgent,
    });

    // Update vote count
    const option = voting.options.find((opt: any) => opt.id === optionId);

    if (!option) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    option.votes += 1;
    await voting.save();

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (error: any) {
    console.error("Vote error:", error);

    // Handle duplicate vote error from MongoDB unique index
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already voted in this poll" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
