import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect();
        const videos = await Video.find({}).sort({ createdAt: -1 }).lean()

        if (!videos || videos.length === 0) {
            return NextResponse.json([], { status: 200 })
        }
        return NextResponse.json(videos);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch videos" },
            { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorised" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const videoId = searchParams.get('id')

        if (!videoId) {
            return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
        }

        await dbConnect();

        // Find the video and check if it belongs to the current user
        const video = await Video.findOne({ _id: videoId, userId: session.user.id })

        if (!video) {
            return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 })
        }

        await Video.findByIdAndDelete(videoId)

        return NextResponse.json({ message: "Video deleted successfully" })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete video" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorised" },
                { status: 401 }
            )
        }
        await dbConnect();
        const body: IVideo = await request.json()
        if (!body.title|| !body.description || !body.videoUrl || !body.thumbnailUrl) {
            return NextResponse.json({ error: "Missing Required fields" },
                { status: 400 })
        }
        const videoData={
            ...body,
            controls: body?.controls ?? true,
            userId: new mongoose.Types.ObjectId(session.user.id),
            transformation: {
                  height: 1920,
                  width: 1080,
                  quality: body.transformation?.quality??100,
                }
        }
       const newVideo= await Video.create(videoData)
       return NextResponse.json(newVideo)
    } catch (error) {
        return NextResponse.json(
                { error: "Failed to create video" },
                { status: 500 }
            )
    }
}

