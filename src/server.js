import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const APP_ENV = process.env.APP_ENV || "dev";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cors({
  origin: ALLOW_ORIGIN === "*" ? true : ALLOW_ORIGIN
}));

// In-memory store para demo
let messages = [
  { id: 1, author: "Sistema", text: "¡Bienvenido a la API dummy!", ts: new Date().toISOString() }
];

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: APP_ENV, time: new Date().toISOString() });
});

app.get("/api/messages", (_req, res) => {
  res.json({ items: messages });
});

app.post("/api/messages", (req, res) => {
  const { author, text } = req.body || {};
  if (!author || !text) {
    return res.status(400).json({ error: "author y text son requeridos" });
  }
  const item = { id: messages.length + 1, author, text, ts: new Date().toISOString() };
  messages.push(item);
  res.status(201).json(item);
});

app.listen(PORT, () => {
  console.log(`[backend] listening on :${PORT} (env=${APP_ENV})`);
});
