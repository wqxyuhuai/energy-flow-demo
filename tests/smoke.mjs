import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const pageUrl = pathToFileURL(join(root, "index.html")).href;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

const chromePath = chromeCandidates.find(existsSync);
if (!chromePath) {
  throw new Error("Chrome was not found. Set CHROME_PATH to run the smoke test.");
}

const profileDir = mkdtempSync(join(tmpdir(), "energy-flow-smoke-"));
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-extensions",
  "--disable-background-networking",
  "--remote-allow-origins=*",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profileDir}`,
  pageUrl
], { stdio: ["ignore", "ignore", "pipe"] });

class CdpSession {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const callback = this.pending.get(message.id);
      if (!callback) return;
      this.pending.delete(message.id);
      if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
      else callback.resolve(message);
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function waitForTargets() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      if (response.ok) {
        const targets = await response.json();
        const pageTarget = targets.find((target) => target.type === "page" && target.url.startsWith("file:"));
        const frameTarget = targets.find((target) => target.type === "iframe" && target.url === "about:srcdoc");
        if (pageTarget && frameTarget) return { pageTarget, frameTarget };
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for Chrome DevTools.");
}

async function evaluate(session, expression) {
  const response = await session.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (response.result?.exceptionDetails) {
    throw new Error(response.result.exceptionDetails.text || "Browser evaluation failed");
  }
  return response.result?.result?.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let topSession;
let frameSession;

try {
  const { pageTarget, frameTarget } = await waitForTargets();

  topSession = new CdpSession(pageTarget.webSocketDebuggerUrl);
  frameSession = new CdpSession(frameTarget.webSocketDebuggerUrl);
  await Promise.all([topSession.open(), frameSession.open()]);
  await topSession.send("Emulation.setDeviceMetricsOverride", {
    width: 1000,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  const labels = await evaluate(frameSession, `(async () => {
    await document.fonts.ready;
    return {
      modes: [...document.querySelectorAll(".fd-color-button")].map((button) => button.textContent.trim()),
      rows: [...document.querySelectorAll(".fd-color-row-title")].map((node) => node.textContent.trim()),
      fonts: [...document.fonts].map((font) => font.status)
    };
  })()`);
  assert(labels.modes.join(",") === "DC,AC", "AC/DC labels are reversed.");
  assert(labels.rows.join(",") === "Base,AC,DC", "Color rows do not match AC/DC semantics.");
  assert(labels.fonts.every((status) => status === "loaded"), "Embedded SF Pro fonts did not load.");

  const lowPower = await evaluate(frameSession, `(() => {
    const range = document.getElementById("fd-range");
    range.value = "0.18";
    range.dispatchEvent(new Event("input", { bubbles: true }));
    return {
      power: document.getElementById("fd-power-value").textContent,
      width: document.getElementById("fd-flow-width").textContent,
      speed: document.getElementById("fd-flow-speed").textContent,
      cap: document.getElementById("fd-cap-note").textContent
    };
  })()`);
  assert(lowPower.power === "−0.18kW", "Low-power value is incorrect.");
  assert(lowPower.width === "1.5px" && lowPower.speed === "10px/s", "Low-power minimum styling is incorrect.");
  assert(lowPower.cap === "<1% of rated power", "Low-power percentage should display below one percent.");

  const highPower = await evaluate(frameSession, `(() => {
    const range = document.getElementById("fd-range");
    range.max = "75";
    range.value = "75";
    range.dispatchEvent(new Event("input", { bubbles: true }));
    return {
      power: document.getElementById("fd-power-value").textContent,
      width: document.getElementById("fd-flow-width").textContent,
      speed: document.getElementById("fd-flow-speed").textContent,
      cap: document.getElementById("fd-cap-note").textContent,
      preset: [...document.querySelectorAll(".fd-preset")].find((button) => button.getAttribute("aria-pressed") === "true")?.textContent
    };
  })()`);
  assert(highPower.power === "−50kW", "Power display is not capped to the inverter rating.");
  assert(highPower.width === "5.0px" && highPower.speed === "90px/s", "Visual response is not capped at 100%.");
  assert(highPower.cap === "100% of rated power" && highPower.preset === "100%", "100% state is inconsistent.");

  await evaluate(frameSession, `(() => {
    const range = document.getElementById("fd-range");
    range.max = "50";
    range.value = "25";
    range.dispatchEvent(new Event("input", { bubbles: true }));
    const pause = document.getElementById("fd-pause");
    if (pause.getAttribute("aria-pressed") === "true") pause.click();
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await evaluate(frameSession, `document.getElementById("fd-pause").click()`);
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvasCount = `(() => {
    const canvas = document.getElementById("fd-flow-canvas");
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) count += 1;
    return count;
  })()`;
  const countBeforeResize = await evaluate(frameSession, canvasCount);
  await topSession.send("Emulation.setDeviceMetricsOverride", {
    width: 700,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  const countAfterResize = await evaluate(frameSession, canvasCount);
  assert(countBeforeResize > 0 && countAfterResize > 0, "Paused flow segment disappeared after resizing.");

  const keyboard = await evaluate(frameSession, `(async () => {
    const trigger = document.getElementById("fd-shape-trigger");
    const menu = document.getElementById("fd-shape-menu");
    trigger.click();
    document.querySelector('[data-shape="straight"]').click();
    trigger.focus();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const first = document.activeElement.textContent.trim();
    document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const second = document.activeElement.textContent.trim();
    document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    const last = document.activeElement.textContent.trim();
    document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    return { first, second, last, closed: menu.hidden, focus: document.activeElement.id };
  })()`);
  assert(keyboard.first === "Straight" && keyboard.second === "L-Shape" && keyboard.last === "S-Shape", "Shape keyboard navigation failed.");
  assert(keyboard.closed && keyboard.focus === "fd-shape-trigger", "Shape menu did not close and return focus.");

  console.log("Smoke tests passed.");
} finally {
  topSession?.close();
  frameSession?.close();
  chrome.kill();
  await new Promise((resolve) => {
    if (chrome.exitCode !== null) return resolve();
    chrome.once("exit", resolve);
    setTimeout(resolve, 2000);
  });
  if (profileDir.startsWith(tmpdir())) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        rmSync(profileDir, { recursive: true, force: true });
        break;
      } catch (error) {
        if (attempt === 4) throw error;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
}
