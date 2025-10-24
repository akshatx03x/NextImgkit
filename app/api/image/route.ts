import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Image, { IImage } from "@/models/Image";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
    try {
        await dbConnect();
        const images = await Image.find({}).sort({ createdAt: -1 }).lean()

        if (!images || images.length === 0) {
            return NextResponse.json([], { status: 200 })
        }
        return NextResponse.json(images);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch images" },
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
        const imageId = searchParams.get('id')

        if (!imageId) {
            return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
        }

        await dbConnect();
        const body: Partial<IImage> = await request.json()

        // Find the image and check if it belongs to the current user
        const image = await Image.findOne({ _id: imageId, userId: session.user.id })

        if (!image) {
            return NextResponse.json({ error: "Image not found or access denied" }, { status: 404 })
        }

        // Regenerate imageUrl if transformation is being updated
        if (body.transformation && body.transformation.aspectRatio) {
            const baseUrl = image.imageUrl.split('?tr=')[0];
            const transform = body.transformation.aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                             body.transformation.aspectRatio === '16:9' ? '' :
                             body.transformation.aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                             body.transformation.aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                             body.transformation.aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
            const transformedImageUrl = transform ? `${baseUrl}?tr=${transform}` : baseUrl;
            body.imageUrl = transformedImageUrl;
        }

        // Update the image
        const updatedImage = await Image.findByIdAndUpdate(imageId, body, { new: true })

        return NextResponse.json(updatedImage)
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update image" },
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
        const imageId = searchParams.get('id')

        if (!imageId) {
            return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
        }

        await dbConnect();

        // Find the image and check if it belongs to the current user
        const image = await Image.findOne({ _id: imageId, userId: session.user.id })

        if (!image) {
            return NextResponse.json({ error: "Image not found or access denied" }, { status: 404 })
        }

        await Image.findByIdAndDelete(imageId)

        return NextResponse.json({ message: "Image deleted successfully" })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete image" },
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
        const body: IImage = await request.json()
        if (!body.title|| !body.description || !body.imageUrl || !body.thumbnailUrl) {
            return NextResponse.json({ error: "Missing Required fields" },
                { status: 400 })
        }
        const aspectRatio = '9:16';
        const transform = aspectRatio === '9:16' ? 'ar-9-16,c-at_max' : '';
        const transformedImageUrl = body.imageUrl.includes('?tr=') ? body.imageUrl : (transform ? `${body.imageUrl}?tr=${transform}` : body.imageUrl);

        const imageData={
            ...body,
            imageUrl: transformedImageUrl,
            userId: new mongoose.Types.ObjectId(session.user.id),
            transformation: {
                  aspectRatio: aspectRatio,
                  height: 1920,
                  width: 1080,
                  quality: body.transformation?.quality??100,
                  filter: body.transformation?.filter??'none',
                }
        }
       const newImage= await Image.create(imageData)
       return NextResponse.json(newImage)
    } catch (error) {
        return NextResponse.json(
                { error: "Failed to create image" },
                { status: 500 }
            )
    }
}
