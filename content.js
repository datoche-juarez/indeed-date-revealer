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

  const formattedDateTime = postedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const timeDiffMs = now - postedDate;
  const timeDiffMinutes = Math.floor(timeDiffMs / 60000);
  const timeDiffHours = Math.floor(timeDiffMinutes / 60);
  const timeDiffDays = Math.floor(timeDiffHours / 24);
  const timeDiffMonths = Math.floor(timeDiffDays / 30);
  const timeDiffYears = Math.floor(timeDiffDays / 365);

  function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  }

  let relativeTime = "";
  if (timeDiffMinutes < 10) {
    relativeTime = "Just posted";
  } else if (timeDiffMinutes < 60) {
    relativeTime = `Posted ${timeDiffMinutes} minute${
      timeDiffMinutes === 1 ? "" : "s"
    } ago`;
  } else if (timeDiffHours < 8) {
    relativeTime = `Posted ${timeDiffHours} hour${
      timeDiffHours === 1 ? "" : "s"
    } ago`;
  } else if (isYesterday(postedDate)) {
    relativeTime = "Posted yesterday";
  } else if (timeDiffDays < 30) {
    relativeTime = `Posted ${timeDiffDays} day${
      timeDiffDays === 1 ? "" : "s"
    } ago`;
  } else if (timeDiffDays < 365) {
    relativeTime = `Posted ${timeDiffMonths} month${
      timeDiffMonths === 1 ? "" : "s"
    } ago`;
  } else {
    relativeTime = `Posted over ${timeDiffYears} year${
      timeDiffYears === 1 ? "" : "s"
    } ago`;
  }

  // Color + label logic
  let borderColor = "#aaa";
  let backgroundColor = "#f3f6fb";
  let pillColor = "#aaa";
  let pillLabel = "📁 Old";

  if (timeDiffMinutes < 10) {
    borderColor = "#d93025";
    pillColor = "#d93025";
    pillLabel = "🔥 Just posted";
    backgroundColor = "#fdecea";
  } else if (timeDiffHours < 1) {
    borderColor = "#ea8600";
    pillColor = "#ea8600";
    pillLabel = "🚨 New";
    backgroundColor = "#fff4e5";
  } else if (timeDiffHours < 8) {
    borderColor = "#4285f4";
    pillColor = "#4285f4";
    pillLabel = "⏳ Recent";
  } else if (isYesterday(postedDate)) {
    borderColor = "#2557a7";
    pillColor = "#2557a7";
    pillLabel = timeDiffHours < 24 ? "🕒 < 24 hrs ago" : "🕒 > 24 hrs ago";
  }

  const badge = document.createElement("div");
  badge.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${borderColor}" viewBox="0 0 16 16" style="vertical-align: text-bottom;">
        <path d="M2 2h1V0h1v2h6V0h1v2h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm12 12V7H2v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1zm0-9V4a1 1 0 0 0-1-1h-1v1h-1V3H5v1H4V3H3a1 1 0 0 0-1 1v1h12z"/>
      </svg>
      <span style="font-weight: 500;">${relativeTime}</span>
      <span style="
        display: inline-block;
        padding: 2px 6px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        background-color: ${pillColor};
        border-radius: 10px;
      ">${pillLabel}</span>
    </div>
    <div style="font-size: 12px; color: #595959;">(${formattedDateTime})</div>
  `;

  badge.style.cssText = `
    background-color: ${backgroundColor};
    color: #1a1a1a;
    padding: 10px 12px;
    margin: 12px 0;
    font-size: 14px;
    border-left: 6px solid ${borderColor};
    font-family: 'Helvetica Neue', Arial, sans-serif;
    border-radius: 6px;
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

        requestAnimationFrame(() => {
          void badge.offsetWidth; // Force reflow
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
