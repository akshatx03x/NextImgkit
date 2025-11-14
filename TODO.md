# ESLint Errors Fix Plan

- [x] Remove the stray "y" from app/components/VideoFeed.tsx
- [x] Remove the unused 'error' parameter from the catch block in app/homepage/page.tsx
- [x] Add alt prop to the Image component in app/imagepage/page.tsx and escape the apostrophe in "Images" if needed
- [x] Replace <img> with <Image> from next/image in app/images/[id]/page.tsx, including necessary imports and props
- [x] Escape the apostrophe in "Don't" in app/login/page.tsx
- [x] Escape the apostrophe in "NextImgKit's" in app/videopage/page.tsx
- [x] Fix TypeScript any types in models/Image.ts and models/Video.ts
- [x] Remove unused imports in models/Video.ts and next-auth.d.ts
- [x] Remove unused 'error' parameter in register/page.tsx
- [x] Run ESLint again to verify all errors are fixed
