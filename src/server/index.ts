import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import configRoutes from "./routes/config.js";
import presetsRoutes from "./routes/presets.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api", configRoutes);
  app.use("/api", presetsRoutes);

  const clientPath = path.join(__dirname, "../client");
  app.use(express.static(clientPath));

  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  });

  return app;
}

export async function startServer(port: number = 3000): Promise<void> {
  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      resolve();
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
        reject(new Error(`Port ${port} is already in use`));
      } else {
        console.error("Server error:", error);
        reject(error);
      }
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("\nSIGINT received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || "3000", 10);
  startServer(port).catch(console.error);
}
