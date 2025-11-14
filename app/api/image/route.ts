import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Image, { IImage } from "@/models/Image";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

function getTransformedImageUrl(baseUrl: string, transformation: IImage['transformation']): string {
  if (baseUrl.includes('?tr=')) return baseUrl;

  const transforms = [];

  // Aspect ratio transformation
  if (transformation.aspectRatio && transformation.aspectRatio !== '16:9') {
    const arTransform = transformation.aspectRatio === '9:16' ? 'ar-9-16,c-at_max' :
                       transformation.aspectRatio === '4:3' ? 'ar-4-3,c-at_max' :
                       transformation.aspectRatio === '1:1' ? 'ar-1-1,c-at_max' :
                       transformation.aspectRatio === '21:9' ? 'ar-21-9,c-at_max' : '';
    if (arTransform) transforms.push(arTransform);
  }

  // Quality transformation
  if (transformation.quality && transformation.quality !== 100) {
    transforms.push(`q-${transformation.quality}`);
  }

  // Filter transformation
  if (transformation.filter && transformation.filter !== 'none') {
    const filterTransform = transformation.filter === 'sepia' ? 'e-sepia' :
                           transformation.filter === 'grayscale' ? 'e-grayscale' :
                           transformation.filter === 'blur' ? 'bl-10' : '';
    if (filterTransform) transforms.push(filterTransform);
  }

  const transformString = transforms.join(',');
  return transformString ? `${baseUrl}?tr=${transformString}` : baseUrl;
}

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
        if (body.transformation) {
            const baseUrl = image.imageUrl.split('?tr=')[0];
            body.imageUrl = getTransformedImageUrl(baseUrl, body.transformation as IImage['transformation']);
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

        const imageData={
            ...body,
            imageUrl: getTransformedImageUrl(body.imageUrl, body.transformation),
            userId: new mongoose.Types.ObjectId(session.user.id),
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
