import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voting from "@/models/Voting";
import { requireAuth } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

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

    const votings = await Voting.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ votings });
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

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const optionsData = formData.get("options") as string;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const options = JSON.parse(optionsData || "[]");

    // Process file uploads for each option
    const processedOptions = await Promise.all(
      options.map(async (option: any, index: number) => {
        const photoFile = formData.get(`photo_${index}`) as File | null;
        const musicFile = formData.get(`music_${index}`) as File | null;

        let photoUrl = option.photoUrl;
        let musicUrl = option.musicUrl;

        if (photoFile && photoFile.size > 0) {
          photoUrl = await saveFile(photoFile, "photo");
        }

        if (musicFile && musicFile.size > 0) {
          musicUrl = await saveFile(musicFile, "music");
        }

        return {
          ...option,
          photoUrl,
          musicUrl,
          votes: 0,
        };
      })
    );

    const voting = await Voting.create({
      title,
      description,
      options: processedOptions,
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

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
