import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voting from "@/models/Voting";
import { requireAuth } from "@/lib/auth";
import { sanitizeOptions, stripHiddenVotes } from "@/lib/votings";

export const dynamic = "force-dynamic";

// GET all votings (with visibility filter for public)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    let query = {};

    if (!isAdmin) {
      // Public view - only visible votings
      query = { isVisible: true };
    } else {
      // Admin view - verify authentication
      try {
        requireAuth(request);
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const votings = await Voting.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      votings: isAdmin ? votings : votings.map(stripHiddenVotes),
    });
  } catch (error) {
    console.error("Get votings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new voting (admin only)
export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
    await dbConnect();

    const { title, description, options } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const voting = await Voting.create({
      title,
      description,
      options: sanitizeOptions(options).map((option) => ({
        ...option,
        votes: 0,
      })),
      isVisible: true,
      isClosed: false,
      showResults: false,
    });

    return NextResponse.json({ voting }, { status: 201 });
  } catch (error: any) {
    console.error("Create voting error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "InvalidMediaUrl") {
      return NextResponse.json(
        { error: "Invalid media URL" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
