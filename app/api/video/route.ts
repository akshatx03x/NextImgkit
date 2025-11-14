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

export async function PUT(request: NextRequest) {
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
        const body: Partial<IVideo> = await request.json()

        // Find the video and check if it belongs to the current user
        const video = await Video.findOne({ _id: videoId, userId: session.user.id })

        if (!video) {
            return NextResponse.json({ error: "Video not found or access denied" }, { status: 404 })
        }

        // Regenerate videoUrl if transformation is being updated
        if (body.transformation) {
            const baseUrl = video.videoUrl.split('?tr=')[0];
            const transforms = [];

            // Aspect ratio transformation
            if (body.transformation.aspectRatio) {
                const arTransform = body.transformation.aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                                   body.transformation.aspectRatio === '16:9' ? '' :
                                   body.transformation.aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                                   body.transformation.aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                                   body.transformation.aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
                if (arTransform) transforms.push(arTransform);
            }

            // Quality transformation
            if (body.transformation.quality && body.transformation.quality !== 100) {
                transforms.push(`q-${body.transformation.quality}`);
            }

            // Filter transformation
            if (body.transformation.filter && body.transformation.filter !== 'none') {
                const filterTransform = body.transformation.filter === 'sepia' ? 'e-sepia' :
                                       body.transformation.filter === 'grayscale' ? 'e-grayscale' :
                                       body.transformation.filter === 'blur' ? 'bl-10' : '';
                if (filterTransform) transforms.push(filterTransform);
            }

            const transformString = transforms.join(',');
            const transformedVideoUrl = transformString ? `${baseUrl}?tr=${transformString}` : baseUrl;
            body.videoUrl = transformedVideoUrl;
        }

        // Update the video
        const updatedVideo = await Video.findByIdAndUpdate(videoId, body, { new: true })

        return NextResponse.json(updatedVideo)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update video" },
            { status: 500 }
        )
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
        const aspectRatio = '9:16';
        const transform = aspectRatio === '9:16' ? 'ar-9-16,c-at_max' : '';
        const transformedVideoUrl = body.videoUrl.includes('?tr=') ? body.videoUrl : (transform ? `${body.videoUrl}?tr=${transform}` : body.videoUrl);
        const videoData={
            ...body,
            videoUrl: transformedVideoUrl,
            controls: body?.controls ?? true,
            userId: new mongoose.Types.ObjectId(session.user.id),
            transformation: {
                  aspectRatio: aspectRatio,
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