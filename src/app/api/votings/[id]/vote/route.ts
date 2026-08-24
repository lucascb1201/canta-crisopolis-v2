import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voting from "@/models/Voting";
import Vote from "@/models/Vote";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let voteId: unknown = null;

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
    const voting = await Voting.findById(params.id).lean<any>();

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    if (voting.isClosed) {
      return NextResponse.json(
        { error: "This voting is closed" },
        { status: 400 }
      );
    }

    // Validar a opção ANTES de gravar o voto: um optionId inválido gravado
    // dispara o índice único e bloqueia o dispositivo permanentemente.
    const option = voting.options.find((opt: any) => opt.id === optionId);

    if (!option) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    // Get IP and User Agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // O índice único {votingId, deviceFingerprint} é a barreira anti-duplicata
    const vote = await Vote.create({
      votingId: params.id,
      optionId,
      deviceFingerprint,
      ipAddress,
      userAgent,
    });

    voteId = vote._id;

    // $inc é atômico; um read-modify-write perderia votos concorrentes
    const result = await Voting.updateOne(
      { _id: params.id, isClosed: false, "options.id": optionId },
      { $inc: { "options.$.votes": 1 } }
    );

    if (result.matchedCount === 0) {
      // A votação fechou ou a opção sumiu entre a leitura e a escrita
      await Vote.deleteOne({ _id: voteId });

      return NextResponse.json(
        { error: "This voting is no longer accepting votes" },
        { status: 400 }
      );
    }

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

    if (voteId) {
      await Vote.deleteOne({ _id: voteId }).catch(() => {});
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
