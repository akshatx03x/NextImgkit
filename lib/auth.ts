import { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions:NextAuthOptions = {
    providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
   }),
   CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "email", type: "text", placeholder: "jsmith@gmail.com" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if(!credentials?.email || !credentials?.password) {
        throw new Error("Email and Password required");
      }
      try {
        await dbConnect();
        const existingUser = await User.findOne({email: credentials.email});
        if(!existingUser) {
          throw new Error("No user found with the given email");
        }
      const isValid= await bcrypt.compare(credentials.password, existingUser.password);
        if(!isValid) {
            throw new Error("Invalid password");
        }
        return {id: existingUser._id.toString(), email: existingUser.email};
      } catch (error) {
        console.error("Authorize error:", error);
        throw new Error("Error during authentication");
      }
    }
  })
  ],
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.id = user.id;
        }
      return token
    },
    async session({session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
        }
      return session;
    },
},
    pages: {
        signIn: "/login",
        error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};