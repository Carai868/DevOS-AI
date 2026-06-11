import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import { validateTerminalCommand, validateWorkspacePath } from "../shared/terminalSafety";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

function normalizeExtensionName(name: string) {
  return name
    .trim()
    .replace(/^@/, "")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "extension";
}

function resolveInstallDir(name: string, installDir?: string) {
  const workspaceRoot = path.resolve(process.cwd());
  const safeExtensionsRoot = path.join(workspaceRoot, ".devos", "extensions");
  const fallbackDir = path.join(safeExtensionsRoot, normalizeExtensionName(name));
  const targetDir = installDir ? path.resolve(installDir) : fallbackDir;

  const relativeToRoot = path.relative(safeExtensionsRoot, targetDir);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error("Install path must stay under the workspace extensions directory.");
  }

  return targetDir;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  app.post("/api/extensions/install", async (req, res) => {
    try {
      const { name, installDir } = req.body as { name?: string; installDir?: string };

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({ error: "Extension name is required." });
        return;
      }

      const targetDir = resolveInstallDir(name, installDir);
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, "package.json"), JSON.stringify({
        name,
        version: "1.0.0",
        installedAt: new Date().toISOString(),
        source: "marketplace",
      }, null, 2));

      res.json({
        ok: true,
        message: `Installed ${name} into ${targetDir}`,
        installedPath: targetDir,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown extension install error";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/terminal/execute", async (req, res) => {
    try {
      const { command, cwd } = req.body as { command?: string; cwd?: string };

      const sanitizedCommand = validateTerminalCommand(command);
      const validatedCwd = cwd ? validateWorkspacePath(cwd) : process.cwd();

      const shell = process.platform === "win32" ? "cmd.exe" : "/bin/sh";
      const shellArgs = process.platform === "win32"
        ? ["/d", "/s", "/c", sanitizedCommand]
        : ["-lc", sanitizedCommand];

      const startedAt = Date.now();
      const { stdout, stderr } = await execFileAsync(shell, shellArgs, {
        cwd: validatedCwd,
        maxBuffer: 10 * 1024 * 1024,
        env: process.env,
        timeout: 120_000,
      });

      res.json({
        exitCode: 0,
        stdout,
        stderr,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown terminal error";
      const stderr = message;
      res.status(500).json({
        error: message,
        exitCode: 1,
        stdout: "",
        stderr,
        durationMs: 0,
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
