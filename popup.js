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

  const KEY_SETTING_NAMES = [
    "likeKey",
    "seekBackwardKey",
    "seekForwardKey",
    "shortsUpKey",
    "shortsDownKey",
    "commentsToggleKey",
    "commentsUpKey",
    "commentsDownKey"
  ];

  const KEY_LABELS = {
    ArrowLeft: "←",
    ArrowRight: "→",
    ArrowUp: "↑",
    ArrowDown: "↓",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backslash: "\\",
    Minus: "−",
    Equal: "=",
    Space: "Space",
    Enter: "Enter",
    Backspace: "Backspace",
    Delete: "Delete",
    Home: "Home",
    End: "End",
    PageUp: "Page Up",
    PageDown: "Page Down"
  };

  const previewStore = { ...DEFAULT_SETTINGS };
  const extensionApi = globalThis.chrome;
  const storageArea = extensionApi?.storage?.sync || {
    get(defaults, callback) {
      callback({ ...defaults, ...previewStore });
    },
    set(changes, callback) {
      Object.assign(previewStore, changes);
      callback?.();
    }
  };

  let settings = { ...DEFAULT_SETTINGS };
  let capturingButton = null;
  let statusTimer = null;

  const status = document.getElementById("status");

  function formatKey(code) {
    if (KEY_LABELS[code]) return KEY_LABELS[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad[0-9]$/.test(code)) return `Num ${code.slice(6)}`;
    return code.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  function showStatus(message, type = "saved") {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.className = type === "error" ? "is-error" : "is-saved";
    statusTimer = setTimeout(() => {
      status.textContent = "Settings save automatically";
      status.className = "";
    }, 1800);
  }

  function render() {
    document.querySelectorAll("[data-setting]").forEach((input) => {
      input.checked = Boolean(settings[input.dataset.setting]);
    });

    document.querySelectorAll("[data-number-setting]").forEach((input) => {
      input.value = settings[input.dataset.numberSetting];
    });

    document.querySelectorAll("[data-key-setting]").forEach((button) => {
      button.textContent = formatKey(settings[button.dataset.keySetting]);
      button.setAttribute(
        "aria-label",
        `${button.previousElementSibling?.textContent || "Shortcut"}: ${button.textContent}. Click to change.`
      );
    });

    document.body.classList.toggle("is-disabled", !settings.enabled);
  }

  function save(changes, message = "Saved") {
    settings = { ...settings, ...changes };
    storageArea.set(changes, () => {
      if (extensionApi?.runtime?.lastError) {
        showStatus("Could not save", "error");
        return;
      }
      showStatus(message);
    });
  }

  function stopCapturing() {
    if (!capturingButton) return;
    capturingButton.classList.remove("is-capturing");
    capturingButton.textContent = formatKey(settings[capturingButton.dataset.keySetting]);
    capturingButton = null;
  }

  function startCapturing(button) {
    stopCapturing();
    capturingButton = button;
    button.classList.add("is-capturing");
    button.textContent = "Press key";
  }

  function keyAlreadyUsed(code, currentSetting) {
    return KEY_SETTING_NAMES.some(
      (settingName) => settingName !== currentSetting && settings[settingName] === code
    );
  }

  document.querySelectorAll("[data-setting]").forEach((input) => {
    input.addEventListener("change", () => {
      save({ [input.dataset.setting]: input.checked });
      render();
    });
  });

  document.querySelectorAll("[data-number-setting]").forEach((input) => {
    input.addEventListener("change", () => {
      const minimum = Number(input.min);
      const maximum = Number(input.max);
      const value = Math.min(maximum, Math.max(minimum, Number(input.value)));
      input.value = value;
      save({ [input.dataset.numberSetting]: value });
    });
  });

  document.querySelectorAll("[data-key-setting]").forEach((button) => {
    button.addEventListener("click", () => startCapturing(button));
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (!capturingButton) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.code === "Escape") {
        stopCapturing();
        showStatus("Change cancelled", "error");
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        showStatus("Use one key without modifiers", "error");
        return;
      }

      const settingName = capturingButton.dataset.keySetting;
      if (keyAlreadyUsed(event.code, settingName)) {
        showStatus(`${formatKey(event.code)} is already assigned`, "error");
        return;
      }

      const button = capturingButton;
      save({ [settingName]: event.code }, `${formatKey(event.code)} assigned`);
      button.classList.remove("is-capturing");
      button.textContent = formatKey(event.code);
      capturingButton = null;
      render();
    },
    true
  );

  document.getElementById("resetButton").addEventListener("click", () => {
    stopCapturing();
    storageArea.set(DEFAULT_SETTINGS, () => {
      settings = { ...DEFAULT_SETTINGS };
      render();
      showStatus("Defaults restored");
    });
  });

  storageArea.get(DEFAULT_SETTINGS, (storedSettings) => {
    settings = { ...DEFAULT_SETTINGS, ...storedSettings };
    render();
  });
})();
