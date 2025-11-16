Imagekit

A full-stack Next.js application for image + video editing, download, and integration with ImageKit.io and AI video generation

🚀 Why this exists

During my hackathon and project-prep phase (and especially as I focus on MERN-+Next.js and AI/ML integration), I wanted a standalone, deployable demo that:

handles media (images/videos) editing & download

uses real-time features (e.g., group video calls, file share) via WebRTC/Socket.io

integrates an external service (ImageKit) for media infrastructure

can be shown live during interviews or internship pitches
This repo is the culmination of that — a project that stands out, showcases web dev + cloud + AI touches.

🎯 Features

Next.js (TypeScript) frontend + API routes

Media upload/edit (photo + video) via ImageKit SDK

Download edited assets to client

Group video call functionality (WebRTC)

Real-time chat & file sharing (Socket.io)

Notes app for shared meeting minutes

AI video generation (via Gemini API) for discussion question generation

Free-hosting friendly (no paid services required)

🧰 Tech Stack

Frontend: Next.js with TypeScript

Backend/API: Next.js API routes (Node)

Realtime: Socket.io for chat/file transfer + WebRTC for video calls

Media & Storage: ImageKit.io (upload, transform, deliver)

AI/ML Integration: Gemini API (or another GenAI tool)

Database (if applicable): Mongoose / MongoDB (optional)

Hosting: Vercel (or any free-tier platform)

📥 Getting Started
Prerequisites

Node.js (v16+) & npm/yarn/pnpm

An account with ImageKit.io (to get an API key and endpoint)

(Optional) A Gemini API key or equivalent for AI video generation

Setup
git clone https://github.com/akshatx03x/Imagekit.git
cd Imagekit
npm install            # or yarn / pnpm

Configure environment

Create a .env.local (or similar) file in the root with values like:

NEXT_PUBLIC_IMAGEKIT_URL = https://<your-imagekit-endpoint>
IMAGEKIT_API_KEY          = <your-imagekit-api-key>
IMAGEKIT_PRIVATE_KEY      = <your-imagekit-private-key>
GEMINI_API_KEY            = <your-gemini-api-key>         # optional

Run locally
npm run dev
# or
yarn dev


Then open http://localhost:3000
 in your browser.

Build & deploy
npm run build
npm start


You can deploy to Vercel directly (just link your GitHub repo) or any free-hosting capable of Node/Next.js.

🧩 Project Structure

A quick overview:

/app                 – Next.js “app” directory (pages, components, styling)  
/lib                 – utility libraries (e.g., ImageKit helper, socket init)  
/models              – database models (if using MongoDB/Mongoose)  
/public              – static assets (images, icons)  
/register            – maybe a sub-app for user registration/auth?  
middleware.ts        – Next.js middleware config  
next.config.ts       – Next.js config  
tsconfig.json        – TypeScript config  
types.d.ts           – global type definitions  

✅ What makes this stand out

It combines front-end + back-end + realtime + media processing + AI — demonstrating breadth and integration.

The use of ImageKit gives you real-world media infra instead of toy uploads.

Free-hosting friendly: you are not relying on costly services; this is deploy-ready.

Good project to demo during internships/interviews — you can walk through architecture & highlight each piece.
