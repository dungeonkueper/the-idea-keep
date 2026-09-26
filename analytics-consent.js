(() => {
  const token = document.currentScript?.dataset.analyticsToken;
  const panel = document.getElementById("analytics-consent");
  const settings = document.getElementById("analytics-settings");
  if (!token || !panel || !settings) return;

  // Namespace choices to this site on the shared github.io origin.
  const key = "the-idea-keep:analytics-consent:v1";
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const status = document.getElementById("analytics-status");
  const close = document.getElementById("analytics-close");
  let loaded = false;
  let persistent = true;
  let expiryTimer;

  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (
        ["accepted", "rejected"].includes(value?.choice) &&
        Number.isFinite(value.expires) && value.expires > Date.now() &&
        value.expires <= Date.now() + lifetime
      ) return value;
    } catch { /* Unavailable or corrupt storage never grants permission. */ }
    return null;
  }

  // A withdrawal reload must remain disabled even if storage cannot be updated.
  const withdrawalHash = "#analytics-disabled";
  const forcedOff = location.hash === withdrawalHash;
  let choice = forcedOff ? null : readChoice();

  function loadBeacon() {
    if (loaded) return;
    loaded = true;
    const script = document.createElement("script");
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.defer = true;
    script.dataset.cfBeacon = JSON.stringify({ token });
    document.head.append(script);
  }

  function scheduleExpiry() {
    clearTimeout(expiryTimer);
    if (choice?.choice !== "accepted") return;
    // Timers cannot represent the full retention period in one interval.
    expiryTimer = setTimeout(() => {
      if (choice.expires <= Date.now()) withdraw();
      else scheduleExpiry();
    }, Math.min(choice.expires - Date.now(), 2147483647));
  }

  function withdraw() {
    // Removing a script cannot stop its already installed event listeners.
    // Reload the document without the beacon; in-flight reports cannot be recalled.
    location.replace(location.pathname + location.search + withdrawalHash);
    location.reload();
  }

  function hide() {
    panel.hidden = true;
    settings.focus();
  }

  function choose(value) {
    choice = { choice: value, expires: Date.now() + lifetime };
    try {
      localStorage.setItem(key, JSON.stringify(choice));
    } catch {
      persistent = false;
    }
    if (value === "rejected" && loaded) {
      withdraw();
      return;
    }
    if (value === "accepted") {
      if (forcedOff) {
        history.replaceState(null, "", location.pathname + location.search);
      }
      loadBeacon();
      scheduleExpiry();
    }
    hide();
  }

  settings.hidden = false;
  settings.addEventListener("click", () => {
    status.textContent = choice?.choice === "accepted"
      ? "Analytics is allowed. Choosing not to allow it will reload this page."
      : "Analytics is off.";
    close.hidden = false;
    panel.hidden = false;
    document.getElementById("analytics-heading").focus();
  });
  close.addEventListener("click", hide);
  document.getElementById("analytics-reject").addEventListener(
    "click",
    () => choose("rejected"),
  );
  document.getElementById("analytics-accept").addEventListener(
    "click",
    () => choose("accepted"),
  );
  // A choice made in another tab must also apply here.
  addEventListener("storage", (event) => {
    if (event.key !== key && event.key !== null) return;
    choice = readChoice();
    if (loaded && choice?.choice !== "accepted") withdraw();
    else if (choice?.choice === "accepted" && !forcedOff) {
      loadBeacon();
      scheduleExpiry();
      panel.hidden = true;
    } else panel.hidden = !(!choice && !forcedOff);
  });
  addEventListener("pageshow", (event) => {
    if (
      event.persisted && loaded && persistent &&
      readChoice()?.choice !== "accepted"
    ) withdraw();
  });
  if (choice?.choice === "accepted") {
    loadBeacon();
    scheduleExpiry();
  } else panel.hidden = Boolean(choice) || forcedOff;
})();
