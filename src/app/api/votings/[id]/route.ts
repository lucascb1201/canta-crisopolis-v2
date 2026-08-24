import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voting from "@/models/Voting";
import Vote from "@/models/Vote";
import { requireAuth, getAuthUser } from "@/lib/auth";
import { deleteBlobs } from "@/lib/blob";
import { sanitizeOptions, stripHiddenVotes } from "@/lib/votings";

export const dynamic = "force-dynamic";

// GET single voting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const voting = await Voting.findById(params.id).lean();

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    const isAdmin = !!getAuthUser(request);

    return NextResponse.json({
      voting: isAdmin ? voting : stripHiddenVotes(voting),
    });
  } catch (error) {
    console.error("Get voting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update voting (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(request);
    await dbConnect();

    const body = await request.json();
    const { title, description, isVisible, isClosed, showResults, options } =
      body;

    const voting = await Voting.findById(params.id);

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    if (title) voting.title = title;
    if (description !== undefined) voting.description = description;
    if (isVisible !== undefined) voting.isVisible = !!isVisible;
    if (isClosed !== undefined) voting.isClosed = !!isClosed;
    if (showResults !== undefined) voting.showResults = !!showResults;

    let orphanedUrls: (string | undefined)[] = [];

    if (options !== undefined) {
      const incoming = sanitizeOptions(options);

      const previousUrls = new Set<string>();
      voting.options.forEach((option: any) => {
        if (option.photoUrl) previousUrls.add(option.photoUrl);
        if (option.musicUrl) previousUrls.add(option.musicUrl);
      });

      const processedOptions = incoming.map((option) => {
        // Preserve existing votes
        const existingOption = voting.options.find(
          (o: any) => o.id === option.id
        );

        return {
          ...option,
          votes: existingOption ? existingOption.votes : 0,
        };
      });

      // Toda URL que existia antes e não aparece mais vira um blob órfão
      processedOptions.forEach((option) => {
        if (option.photoUrl) previousUrls.delete(option.photoUrl);
        if (option.musicUrl) previousUrls.delete(option.musicUrl);
      });

      orphanedUrls = Array.from(previousUrls);

      voting.options = processedOptions;
    }

    await voting.save();

    await deleteBlobs(orphanedUrls);

    return NextResponse.json({ voting });
  } catch (error: any) {
    console.error("Update voting error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "InvalidMediaUrl") {
      return NextResponse.json({ error: "Invalid media URL" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE voting (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(request);
    await dbConnect();

    const voting = await Voting.findByIdAndDelete(params.id);

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    await Vote.deleteMany({ votingId: params.id });

    await deleteBlobs(
      voting.options.flatMap((option: any) => [
        option.photoUrl,
        option.musicUrl,
      ])
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete voting error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
