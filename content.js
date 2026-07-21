(() => {
  "use strict";

  const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    likeEnabled: true,
    seekEnabled: true,
    shortsNavigationEnabled: true,
    commentsEnabled: true,
    smoothComments: true,
    likeKey: "KeyL",
    seekBackwardKey: "ArrowLeft",
    seekForwardKey: "ArrowRight",
    shortsUpKey: "KeyK",
    shortsDownKey: "KeyJ",
    commentsToggleKey: "Semicolon",
    commentsUpKey: "BracketLeft",
    commentsDownKey: "Quote",
    seekSeconds: 5,
    commentScrollPercent: 85
  });

  let settings = { ...DEFAULT_SETTINGS };

  chrome.storage.sync.get(DEFAULT_SETTINGS, (storedSettings) => {
    settings = { ...DEFAULT_SETTINGS, ...storedSettings };
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;

    for (const [key, change] of Object.entries(changes)) {
      if (key in DEFAULT_SETTINGS) settings[key] = change.newValue;
    }
  });

  function isTypingTarget(target) {
    if (!(target instanceof Element)) return false;

    return Boolean(
      target.closest(
        'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]'
      )
    );
  }

  function isVisible(element) {
    if (!(element instanceof Element)) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  }

  function isOnScreen(element) {
    if (!isVisible(element)) return false;
    const rect = element.getBoundingClientRect();

    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    );
  }

  function getActiveShort() {
    const playingShortVideo = [...document.querySelectorAll("ytd-reel-video-renderer video")]
      .filter((video) => !video.paused && !video.ended && isOnScreen(video))
      .sort((a, b) => {
        const aArea = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
        const bArea = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
        return bArea - aArea;
      })[0];

    if (playingShortVideo) {
      return playingShortVideo.closest("ytd-reel-video-renderer");
    }

    const centerY = window.innerHeight / 2;
    return [...document.querySelectorAll("ytd-reel-video-renderer")]
      .filter(isOnScreen)
      .sort((a, b) => {
        const aCenter = a.getBoundingClientRect().top + a.getBoundingClientRect().height / 2;
        const bCenter = b.getBoundingClientRect().top + b.getBoundingClientRect().height / 2;
        return Math.abs(aCenter - centerY) - Math.abs(bCenter - centerY);
      })[0];
  }

  function getActiveVideo() {
    const short = getActiveShort();
    const shortVideo = short?.querySelector("video");
    if (shortVideo instanceof HTMLVideoElement) return shortVideo;

    const mainVideo = document.querySelector("video.html5-main-video");
    if (mainVideo instanceof HTMLVideoElement && isVisible(mainVideo)) return mainVideo;

    return [...document.querySelectorAll("video")]
      .filter(isVisible)
      .sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
  }

  function getLikeScope() {
    return (
      getActiveShort() ||
      document.querySelector("ytd-watch-metadata") ||
      document.querySelector("ytd-watch-flexy") ||
      document
    );
  }

  function looksLikeLikeButton(button) {
    const label = [
      button.getAttribute("aria-label"),
      button.getAttribute("title"),
      button.textContent
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase();

    return /\b(unlike|like)\b/.test(label) && !/\bdislike\b/.test(label);
  }

  function findLikeButton() {
    const scope = getLikeScope();
    const stableSelectors = [
      "#like-button button",
      "#segmented-like-button button",
      "like-button-view-model button",
      "ytd-like-button-renderer button"
    ];

    for (const selector of stableSelectors) {
      const match = [...scope.querySelectorAll(selector)].find(isVisible);
      if (match) return match;
    }

    const fallbackSelectors = [
      "toggle-button-view-model button[aria-pressed]",
      "button[aria-pressed]"
    ];

    for (const selector of fallbackSelectors) {
      const match = [...scope.querySelectorAll(selector)].find(
        (button) => isVisible(button) && looksLikeLikeButton(button)
      );
      if (match) return match;
    }

    return [...scope.querySelectorAll("button")].find(
      (button) => isVisible(button) && looksLikeLikeButton(button)
    );
  }

  function getOpenCommentsPanel() {
    return [...document.querySelectorAll("ytd-engagement-panel-section-list-renderer")].find(
      (panel) =>
        isOnScreen(panel) &&
        [...panel.querySelectorAll("h2[aria-label]")].some((heading) =>
          /^comments\b/i.test(heading.getAttribute("aria-label") || "")
        )
    );
  }

  function findCommentsButton() {
    const short = getActiveShort();
    if (!short) return;

    return [...short.querySelectorAll("button")].find((button) => {
      const label = button.getAttribute("aria-label") || "";
      return isOnScreen(button) && /^view\s+.*\bcomments?$/i.test(label);
    });
  }

  function toggleComments() {
    const openPanel = getOpenCommentsPanel();

    if (openPanel) {
      const closeButton = [...openPanel.querySelectorAll('button[aria-label="Close"]')].find(
        isOnScreen
      );
      closeButton?.click();
      return;
    }

    findCommentsButton()?.click();
  }

  function scrollComments(direction) {
    const panel = getOpenCommentsPanel();
    if (!panel) return;

    const scrollContainer = [...panel.querySelectorAll("*")]
      .filter((element) => {
        const overflowY = getComputedStyle(element).overflowY;
        return (
          isOnScreen(element) &&
          (overflowY === "auto" || overflowY === "scroll") &&
          element.scrollHeight > element.clientHeight + 20
        );
      })
      .sort(
        (a, b) =>
          b.scrollHeight - b.clientHeight - (a.scrollHeight - a.clientHeight)
      )[0];

    if (!scrollContainer) return;

    scrollContainer.scrollBy({
      top:
        direction *
        Math.max(
          120,
          Math.round(
            scrollContainer.clientHeight *
              Math.min(1, Math.max(0.25, settings.commentScrollPercent / 100))
          )
        ),
      behavior: settings.smoothComments ? "smooth" : "auto"
    });
  }

  function toggleLike() {
    const likeButton = findLikeButton();
    if (!likeButton) return;
    likeButton.click();
  }

  function seekBy(seconds) {
    const video = getActiveVideo();
    if (!video) return;

    const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
    const nextTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    video.currentTime = nextTime;
  }

  function navigateShorts(direction) {
    const activeShort = getActiveShort();
    if (!activeShort) return;

    const shortsContainer =
      activeShort.closest("ytd-shorts")?.querySelector("#shorts-container") ||
      document.querySelector("ytd-shorts #shorts-container");
    if (!shortsContainer) return;

    const shorts = [...shortsContainer.querySelectorAll("ytd-reel-video-renderer")];
    const activeIndex = shorts.indexOf(activeShort);
    const targetShort = shorts[activeIndex + direction];

    if (targetShort) {
      targetShort.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
      return;
    }

    shortsContainer.scrollBy({
      top: direction * shortsContainer.clientHeight,
      behavior: "smooth"
    });
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        !settings.enabled ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      if (settings.likeEnabled && event.code === settings.likeKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleLike();
        return;
      }

      if (settings.commentsEnabled && event.code === settings.commentsToggleKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        toggleComments();
        return;
      }

      if (settings.commentsEnabled && event.code === settings.commentsUpKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        scrollComments(-1);
        return;
      }

      if (settings.commentsEnabled && event.code === settings.commentsDownKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        scrollComments(1);
        return;
      }

      if (
        settings.shortsNavigationEnabled &&
        (event.code === settings.shortsUpKey || event.code === settings.shortsDownKey)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navigateShorts(event.code === settings.shortsUpKey ? -1 : 1);
        return;
      }

      if (
        settings.seekEnabled &&
        (event.code === settings.seekBackwardKey ||
          event.code === settings.seekForwardKey)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const direction = event.code === settings.seekBackwardKey ? -1 : 1;
        seekBy(direction * Math.min(60, Math.max(1, settings.seekSeconds)));
      }
    },
    true
  );
})();
