import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Vote from "@/models/Vote";

export const dynamic = "force-dynamic";

// Uma home com muitas votações não justifica uma consulta ilimitada.
const MAX_VOTINGS = 100;

/**
 * Responde de uma vez em quais votações este dispositivo já votou.
 *
 * Substitui uma requisição por votação: o filtro combina `votingId` e
 * `deviceFingerprint`, que é exatamente o índice único de `Vote`, então tudo
 * sai de uma única operação no banco.
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { deviceFingerprint, votingIds } = await request.json();

    if (!deviceFingerprint || !Array.isArray(votingIds)) {
      return NextResponse.json(
        { error: "Device fingerprint and voting IDs are required" },
        { status: 400 }
      );
    }

    // Um id malformado faria o Mongoose lançar no cast
    const ids = votingIds
      .slice(0, MAX_VOTINGS)
      .filter(
        (id: unknown): id is string =>
          typeof id === "string" && mongoose.Types.ObjectId.isValid(id)
      );

    if (ids.length === 0) {
      return NextResponse.json({ votes: {} });
    }

    const votes = await Vote.find({
      votingId: { $in: ids },
      deviceFingerprint,
    })
      .select("votingId optionId")
      .lean();

    const result: Record<string, string> = {};

    for (const vote of votes) {
      result[String(vote.votingId)] = vote.optionId;
    }

    return NextResponse.json({ votes: result });
  } catch (error) {
    console.error("Check votes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
