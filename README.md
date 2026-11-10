# Smart Attendance: Web Dashboards

The admin and teacher dashboards for my Smart Attendance system. The API they talk to is in [smart-attendance-backend](https://github.com/Bharath5551/smart-attendance-backend).

**Live (admin dashboard):** https://websites-for-smartattendence.vercel.app

> The API is on Render's free tier, so the first login can take around 30 seconds while it wakes up.

## What's here

**`admin-dashboard/`**: admins log in, create teacher accounts, and assign subjects to them.

**`teacher-dashboard-static/`**: teachers log in, manage their students, start a time-limited attendance session that shows a QR code, and watch attendance come in.

Students mark attendance by scanning that QR code in the Android app.

## Tech

HTML, CSS and vanilla JavaScript, talking to a Node.js + MongoDB API with JWT auth. Hosted on Vercel.

## Run it locally

There's no build step. Serve either folder with any static server:

```bash
npx serve admin-dashboard
```
