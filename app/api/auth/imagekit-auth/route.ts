// File: app/api/upload-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {
    try {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

        if (!privateKey || !publicKey) {
            console.error('Missing ImageKit environment variables');
            return Response.json({
                error: "ImageKit configuration is missing. Please check your environment variables."
            }, { status: 500 });
        }

        const { token, expire, signature } = getUploadAuthParams({
            privateKey: privateKey, // Never expose this on client side
            publicKey: publicKey,
        })

        console.log('ImageKit auth params generated:', { token: token ? 'present' : 'missing', expire, signature: signature ? 'present' : 'missing' });

        return Response.json({ token, expire, signature, publicKey })
    } catch (error) {
        console.error('ImageKit auth error:', error);
        return Response.json({
            error: ("Authentication failed for ImageKit")
        },
            { status: 500 })
    }
}
