# TODO: Set Default Aspect Ratio to 9:16 for Videos

## Tasks
- [x] Update models/Video.ts to include aspectRatio in transformation schema with default '9:16'
- [x] Update app/api/video/route.ts POST to set aspectRatio: '9:16' in transformation
- [x] Update app/components/VideoComponent.tsx to default aspectRatio to '9:16' in getAspectRatio, select value, and handleAspectRatioChange dimensions (set '9:16' to 1080x1920, '16:9' to 1920x1080)
