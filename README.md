# Indeed Date Revealer

A lightweight Chrome extension that displays the exact posting date and time on Indeed job listings, with smart relative time formatting (e.g. "Just posted", "3 hours ago", "2 months ago") and visual highlights for new listings.

## Features

- 📅 Extracts hidden `datePosted` data from job listings
- 🕒 Shows both absolute date/time and relative time ("Just posted", etc.)
- 🎨 Color-coded border and icon based on how recently the job was posted
- ⚡ Automatically reinserts the badge even if the page re-renders

## Installation (Development Mode)

1. Clone or download this repo
2. Visit `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the project folder

The extension will now run automatically on Indeed job listings.

## How It Works

Indeed embeds job metadata (like `datePosted`) in a hidden `<script type="application/ld+json">` tag. This extension parses that JSON, formats the date/time, and injects a styled badge into the job listing UI. It uses polling and a fade-in animation to gracefully survive dynamic page changes.

## When the Extension Works

📝 **Important**: This extension only works on **dedicated job listing pages**.

- ✅ It works when you open an individual job listing in its own tab or page (e.g. `https://www.indeed.com/viewjob?...`)
- ❌ It does **not** work on the **search results page**, which shows multiple job previews (with the sidebar layout). Those preview panels do not include the structured `datePosted` data.
- 💡 To use the extension, simply **right-click a job listing and open it in a new tab**.

## Coming Soon

- Options page for customizing colors or relative time format
- Support for dark mode
- Firefox support

## License

MIT
