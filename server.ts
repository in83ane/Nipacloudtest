import 'dotenv/config';
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import ticketRouter from "./src/server/presentation/ticket.controller";
import { requestLogger, errorHandler } from "./src/server/presentation/middleware";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API routes
app.use("/api/tickets", ticketRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function setupVite() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

if (process.env.NODE_ENV !== "production") {
  setupVite().then(() => {
    app.use(errorHandler);
    if (!process.env.VERCEL) {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    }
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.use(errorHandler);
  
  // Only listen if not on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

// Export the app for Vercel serverless
export default app;
