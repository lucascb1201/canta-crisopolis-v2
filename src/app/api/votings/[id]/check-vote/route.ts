import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { deviceFingerprint } = await request.json();

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: "Device fingerprint is required" },
        { status: 400 }
      );
    }

    const existingVote = await Vote.findOne({
      votingId: params.id,
      deviceFingerprint,
    });

    return NextResponse.json({
      hasVoted: !!existingVote,
      votedOptionId: existingVote?.optionId || null,
    });
  } catch (error) {
    console.error("Check vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
