# PotholeScan Refactor TODO

## Phase 1: Frontend Refactor
- [x] Remove client-side Roboflow inference logic
- [x] Add Browse Files input method
- [x] Add Take Photo (camera) input method
- [x] Add Live Stream input method
- [x] Add WebRTC Stream input method
- [x] Update UI to display Roboflow API results only
- [ ] Update branding to realistic professional design (not AI-generated)

## Phase 2: Backend API
- [x] Create Roboflow proxy endpoint (`/api/trpc/detection.analyze`)
- [x] Add image upload handling
- [x] Add streaming support for live/WebRTC feeds
- [x] Implement frame capture and analysis for video streams

## Phase 3: Streaming Features
- [x] Implement Live Stream video capture
- [x] Implement WebRTC Stream support
- [x] Add real-time detection results display
- [x] Add frame rate and performance monitoring

## Phase 4: Design & Polish
- [ ] Update color palette (realistic, not AI aesthetic)
- [ ] Update typography and layout
- [ ] Update hero section with realistic imagery
- [ ] Add About page
- [x] Add Contact page with team members
- [ ] Add settings panel (gear icon)

## Current Fixes
- [x] Add bounding boxes overlay from Roboflow predictions
- [x] Rename site to NaveEye
- [x] Add Contact page

## Phase 5: Testing & Delivery
- [ ] Test all input methods
- [ ] Test Roboflow API integration
- [ ] Test streaming features
- [ ] Performance optimization
- [ ] Final checkpoint and delivery
