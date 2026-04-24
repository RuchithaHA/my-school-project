const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Starts a child process and returns a handle for cleanup.
function startProcess(command, args, cwd) {
  return spawn(command, args, { cwd, shell: true, stdio: "pipe" });
}

function stopProcessTree(proc) {
  if (!proc || !proc.pid) return;
  // On Windows, ensure child processes (vite/uvicorn) are also terminated.
  try {
    spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { shell: true, stdio: "ignore" });
  } catch {
    // Best effort.
  }
}

// Waits until HTTP endpoint becomes available.
async function waitForUrl(url, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

// Runs browser checks on both home and admin views.
async function run() {
  const root = process.cwd();
  const backend = startProcess(
    "python",
    ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    path.join(root, "backend")
  );
  const frontend = startProcess("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"], path.join(root, "frontend"));

  try {
    await waitForUrl("http://127.0.0.1:8000/api/health");
    await waitForUrl("http://127.0.0.1:5173");

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    const artifactsDir = path.join(root, "test-artifacts");
    try {
      fs.mkdirSync(artifactsDir, { recursive: true });
    } catch {}

    const consoleLogs = [];
    page.on("console", (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on("pageerror", (err) => consoleLogs.push(`[pageerror] ${err.message || String(err)}`));

    const fail = async (name, err) => {
      try {
        await page.screenshot({ path: path.join(artifactsDir, `${name}.png`), fullPage: true });
      } catch {}
      try {
        fs.writeFileSync(path.join(artifactsDir, "browser-console.log"), consoleLogs.join("\n"));
      } catch {}
      throw err;
    };

    try {
      await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
      await page.waitForSelector("#hero", { timeout: 30000 });
      await page.waitForSelector("#about");
      await page.waitForSelector("#curriculum");
      await page.waitForSelector("#fees");
      await page.waitForSelector("#timings");
      await page.waitForSelector("#seats");
      await page.waitForSelector("#facilities");
      await page.waitForSelector("#faculty");
      await page.waitForSelector("#testimonials");
      await page.waitForSelector("#gallery");
      await page.waitForSelector("#contact");

      await page.goto("http://127.0.0.1:5173/apply", { waitUntil: "networkidle" });
      await page.waitForSelector("text=Admission Form");

      await page.fill('input[name="student_name"]', "Test Student");
      await page.fill('input[name="date_of_birth"]', "2015-06-10");
      await page.selectOption('select[name="gender"]', "Female");
      await page.selectOption('select[name="class_applying"]', "Class 3-5");
      await page.click("text=Continue");

      await page.fill('input[name="parent_email"]', "parent@example.com");
      await page.fill('input[name="parent_phone"]', "+91 9000000000");
      await page.click("text=Continue");

      await page.fill('textarea[name="address"]', "Bengaluru, Karnataka");
      await page.fill('input[name="city"]', "Bengaluru");
      await page.fill('input[name="pincode"]', "560001");
      await page.click("text=Continue");

      await page.click("text=Submit Application");
      await page.waitForURL("**/thank-you", { timeout: 60000 });
      await page.waitForSelector("text=Thank you for applying!", { timeout: 60000 });

      await page.goto("http://127.0.0.1:5173/admin", { waitUntil: "networkidle" });
      await page.waitForSelector("text=Admin Login");
      await page.fill('input[type="password"]', "admin123");
      await page.click('button:has-text("Login")');
      await page.waitForFunction(() => sessionStorage.getItem("gis_admin_authed") === "true", null, { timeout: 10000 });
      await page.waitForSelector("text=Admin Dashboard", { timeout: 30000 });

      await browser.close();
      console.log("E2E tests passed.");
    } catch (err) {
      await fail("e2e-failed", err);
    }
  } finally {
    stopProcessTree(frontend);
    stopProcessTree(backend);
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
