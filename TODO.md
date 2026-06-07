# ANTCPU PHOTOGRAPHY — TODO

## Project Context
Next.js dashboard for photography portfolio management.
Vercel project: https://vercel.com/antcpus-projects/photography
GitHub: https://github.com/ANTCPU/photography

## Completed ✅
- [x] UploadZone — error handling, client-side validation (50MB, file type)
- [x] Retry button on failed uploads
- [x] Inline error messages per upload row
- [x] Clear done button in queue header
- [x] errorMsg added to UploadItem type
- [x] clearDone added to DashboardContext

## Next Build Session

### 1. MP4 / Video Support
- [ ] Add MP4, MOV to accepted formats
- [ ] Decide max file size for video (200MB? 500MB?)
- [ ] Vercel blob size limits — research and document
- [ ] Video category or fold into existing categories?

### 2. Real Upload Progress
- [ ] Replace fake ticker progress with real upload progress
- [ ] Use XMLHttpRequest or fetch with ReadableStream for progress events

### 3. Supabase Integration
- [ ] Wire PhotoAsset to real Supabase table
- [ ] Replace SEED_ASSETS with live data fetch
- [ ] Replace SEED_METRICS with live aggregates

### 4. Auth Gate
- [ ] Add Supabase auth to dashboard
- [ ] Redirect unauthenticated users to /login
- [ ] upload_token cookie — verify server-side in /api/upload

### 5. Portfolio Table
- [ ] Edit status (draft/live/sold/review) inline
- [ ] Set price + antcoin value per asset
- [ ] Bulk actions (delete, change status)

### 6. Antcoin Panel
- [ ] Wire to real transaction data
- [ ] Live sparkline from Supabase

## Notes
- Vercel Blob used for file storage
- upload_token cookie auth currently in place
- Dashboard runs on localhost:3001 locally
