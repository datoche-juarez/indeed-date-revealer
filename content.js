(function () {
  console.log("[Indeed Date Revealer] Running content script...");

  const scriptTag = document.querySelector(
    'script[type="application/ld+json"]'
  );
  if (!scriptTag) {
    console.warn("[Indeed Date Revealer] No ld+json script tag found.");
    return;
  }

  const jsonData = JSON.parse(scriptTag.textContent);
  const datePosted = jsonData.datePosted;

  if (!datePosted) {
    console.warn("[Indeed Date Revealer] datePosted not found in JSON.");
    return;
  }

  const now = new Date();
  const postedDate = new Date(datePosted);

  // Full date + time
  const formattedDateTime = postedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Calculate time difference
  const timeDiffMs = now - postedDate;
  const timeDiffMinutes = Math.floor(timeDiffMs / 60000);
  const timeDiffHours = Math.floor(timeDiffMinutes / 60);
  const timeDiffDays = Math.floor(timeDiffHours / 24);
  const timeDiffMonths = Math.floor(timeDiffDays / 30);
  const timeDiffYears = Math.floor(timeDiffDays / 365);

  let relativeTime = "";

  if (timeDiffMinutes < 10) {
    relativeTime = "Just posted";
  } else if (timeDiffMinutes < 60) {
    relativeTime = `Posted ${timeDiffMinutes} minutes ago`;
  } else if (timeDiffHours < 8) {
    relativeTime = `Posted ${timeDiffHours} hours ago`;
  } else if (timeDiffHours < 24) {
    relativeTime = "Posted yesterday";
  } else if (timeDiffDays < 30) {
    relativeTime = `Posted ${timeDiffDays} days ago`;
  } else if (timeDiffDays < 365) {
    relativeTime = `Posted ${timeDiffMonths} month${
      timeDiffMonths > 1 ? "s" : ""
    } ago`;
  } else {
    relativeTime = `Posted over ${timeDiffYears} year${
      timeDiffYears > 1 ? "s" : ""
    } ago`;
  }

  // Adjust color intensity based on freshness
  let borderColor = "#aaa";
  if (timeDiffMinutes < 10) borderColor = "#d93025"; // red
  else if (timeDiffHours < 1) borderColor = "#1a73e8"; // bright blue
  else if (timeDiffHours < 8) borderColor = "#3367d6"; // medium blue
  else if (timeDiffHours < 24) borderColor = "#2557a7"; // normal blue

  const badge = document.createElement("div");
  badge.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${borderColor}" viewBox="0 0 16 16" style="margin-right: 6px; vertical-align: text-bottom;">
      <path d="M2 2h1V0h1v2h6V0h1v2h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm12 12V7H2v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1zm0-9V4a1 1 0 0 0-1-1h-1v1h-1V3H5v1H4V3H3a1 1 0 0 0-1 1v1h12z"/>
    </svg>
    <span style="font-weight: 500;">${relativeTime}</span>
    <br />
    <span style="font-size: 12px; color: #595959;">(${formattedDateTime})</span>
  `;

  badge.style.cssText = `
    background-color: #f3f6fb;
    color: #1a1a1a;
    padding: 8px 12px;
    margin: 12px 0;
    font-size: 14px;
    border-left: 4px solid ${borderColor};
    font-family: 'Helvetica Neue', Arial, sans-serif;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    opacity: 0;
  `;

  const interval = setInterval(() => {
    const titleEl = document.querySelector(
      '[data-testid="jobsearch-JobInfoHeader-title"]'
    );

    if (titleEl) {
      const alreadyPresent = document.body.contains(badge);
      if (!alreadyPresent) {
        titleEl.insertAdjacentElement("afterend", badge);

        // Fade-in animation
        requestAnimationFrame(() => {
          badge.style.transition = "opacity 1.4s ease";
          badge.style.opacity = "1";
        });

        console.log("[Indeed Date Revealer] Badge (re)inserted.");
      }
    }
  }, 500);

  setTimeout(() => {
    clearInterval(interval);
    console.log("[Indeed Date Revealer] Stopped checking after 10s.");
  }, 10000);
})();
