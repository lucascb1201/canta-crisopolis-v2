import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Voting from "@/models/Voting";
import { requireAuth } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

// GET single voting
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const voting = await Voting.findById(params.id);

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    return NextResponse.json({ voting });
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

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isVisible = formData.get("isVisible") === "true";
    const isClosed = formData.get("isClosed") === "true";
    const showResults = formData.get("showResults") === "true";
    const optionsData = formData.get("options") as string;

    const voting = await Voting.findById(params.id);

    if (!voting) {
      return NextResponse.json({ error: "Voting not found" }, { status: 404 });
    }

    if (title) voting.title = title;
    if (description !== null) voting.description = description;
    voting.isVisible = isVisible;
    voting.isClosed = isClosed;
    voting.showResults = showResults;

    if (optionsData) {
      const options = JSON.parse(optionsData);

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

          // Preserve existing votes
          const existingOption = voting.options.find(
            (o: any) => o.id === option.id
          );

          return {
            ...option,
            photoUrl,
            musicUrl,
            votes: existingOption ? existingOption.votes : 0,
          };
        })
      );

      voting.options = processedOptions;
    }

    await voting.save();

    return NextResponse.json({ voting });
  } catch (error: any) {
    console.error("Update voting error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
