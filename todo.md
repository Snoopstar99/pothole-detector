# PotholeScan Refactor TODO

## Phase 1: Frontend Refactor
- [x] Remove client-side Roboflow inference logic
- [x] Add Browse Files input method
- [x] Add Take Photo (camera) input method
- [ ] Add Live Stream input method (coming soon)
- [ ] Add WebRTC Stream input method (coming soon)
- [x] Update UI to display Roboflow API results only
- [ ] Update branding to realistic professional design (not AI-generated)

## Phase 2: Backend API
- [x] Create Roboflow proxy endpoint (`/api/trpc/detection.analyze`)
- [x] Add image upload handling
- [ ] Add streaming support for live/WebRTC feeds
- [ ] Implement frame capture and analysis for video streams

## Phase 3: Streaming Features
- [ ] Implement Live Stream video capture
- [ ] Implement WebRTC Stream support
- [ ] Add real-time detection results display
- [ ] Add frame rate and performance monitoring

## Phase 4: Design & Polish
- [ ] Update color palette (realistic, not AI aesthetic)
- [ ] Update typography and layout
- [ ] Update hero section with realistic imagery
- [ ] Add About and Contact pages
- [ ] Add settings panel (gear icon)

## Phase 5: Testing & Delivery
- [ ] Test all input methods
- [ ] Test Roboflow API integration
- [ ] Test streaming features
- [ ] Performance optimization
- [ ] Final checkpoint and delivery
