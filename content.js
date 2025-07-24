(function () {
  console.log("[Indeed Date Revealer] Running content script...");

  const scriptTag = document.querySelector(
    'script[type="application/ld+json"]'
  );
  if (!scriptTag)
    return console.warn("[Indeed Date Revealer] No ld+json script tag found.");

  const jsonData = JSON.parse(scriptTag.textContent);
  const datePosted = jsonData.datePosted;
  if (!datePosted)
    return console.warn("[Indeed Date Revealer] datePosted not found in JSON.");

  const postedDate = new Date(datePosted);
  const now = new Date();

  const formattedDateTime = formatDate(postedDate);
  const diffs = calculateTimeDiffs(postedDate, now);
  const relativeTime = getRelativeTimeLabel(diffs, postedDate);
  const style = getBadgeStyle(diffs, postedDate);
  const badge = createBadgeElement(relativeTime, formattedDateTime, style);

  insertBadgeWhenReady(badge);

  // Helper Functions
  function formatDate(date) {
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function calculateTimeDiffs(posted, now) {
    const ms = now - posted;
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    return { ms, minutes, hours, days, months, years };
  }

  function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  }

  function getRelativeTimeLabel(
    { minutes, hours, days, months, years },
    posted
  ) {
    if (minutes < 10) return "Just posted";
    if (minutes < 60)
      return `Posted ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 8) return `Posted ${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (isYesterday(posted)) return "Posted yesterday";
    if (days < 30) return `Posted ${days} day${days === 1 ? "" : "s"} ago`;
    if (days < 365)
      return `Posted ${months} month${months === 1 ? "" : "s"} ago`;
    return `Posted over ${years} year${years === 1 ? "" : "s"} ago`;
  }

  function getBadgeStyle({ minutes, hours }, posted) {
    let borderColor = "#aaa",
      backgroundColor = "#f3f6fb",
      pillColor = "#aaa",
      pillLabel = "📁 Old";

    if (minutes < 10) {
      borderColor = pillColor = "#d93025";
      backgroundColor = "#fdecea";
      pillLabel = "🔥 Just posted";
    } else if (hours < 1) {
      borderColor = pillColor = "#ea8600";
      backgroundColor = "#fff4e5";
      pillLabel = "🚨 New";
    } else if (hours < 8) {
      borderColor = pillColor = "#4285f4";
      pillLabel = "⏳ Recent";
    } else if (isYesterday(posted)) {
      borderColor = pillColor = "#2557a7";
      pillLabel = hours < 24 ? "🕒 < 24 hrs ago" : "🕒 > 24 hrs ago";
    }

    return { borderColor, backgroundColor, pillColor, pillLabel };
  }

  function createBadgeElement(
    relativeTime,
    formattedDateTime,
    { borderColor, backgroundColor, pillColor, pillLabel }
  ) {
    const badge = document.createElement("div");
    badge.setAttribute("data-testid", "idr-badge");

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

    return badge;
  }

  function insertBadgeWhenReady(badge) {
    const interval = setInterval(() => {
      const titleEl = document.querySelector(
        '[data-testid="jobsearch-JobInfoHeader-title"]'
      );
      if (titleEl && !document.body.contains(badge)) {
        titleEl.insertAdjacentElement("afterend", badge);

        requestAnimationFrame(() => {
          void badge.offsetWidth;
          badge.style.transition = "opacity 1.4s ease";
          badge.style.opacity = "1";
        });

        console.log("[Indeed Date Revealer] Badge (re)inserted.");
      }
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      console.log("[Indeed Date Revealer] Stopped checking after 10s.");
    }, 10000);
  }
})();
