import dbConnect from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(request: NextRequest) {
    try {
        const{email, password} = await request.json();
        if (!email || !password) {
            return NextResponse.json({message: "Email and password are required"}, {status: 400});
        }
        await dbConnect();
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return NextResponse.json({message: "User already exists"}, {status: 400});
        }
        const newUser = new User({email, password});
        await newUser.save();
        return NextResponse.json({message: "User registered successfully"}, {status: 201});
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({message: "Internal Server Error"}, {status: 500});
    }
}