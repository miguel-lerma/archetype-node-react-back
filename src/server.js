import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config(); // en ACA no rompe; simplemente no hay .env

const app = express();

// === Env Vars ===
const APP_ENV = process.env.APP_ENV || "dev";
const PORT = Number(process.env.PORT || 8080);

// CORS: lista separada por comas (sin espacios) o un solo origen.
//  - En dev puedes poner http://localhost:5173
//  - En QA/PRD usa el dominio exacto del FE
const ALLOW_ORIGIN = (process.env.ALLOW_ORIGIN || "").trim();
const allowList = ALLOW_ORIGIN
  ? ALLOW_ORIGIN.split(",").map(s => s.trim()).filter(Boolean)
  : (APP_ENV === "dev" ? ["http://localhost:5173"] : []);

// Front Door secret header (se exige fuera de dev si está configurado)
const AFD_REQUIRED_HEADER_NAME = process.env.AFD_REQUIRED_HEADER_NAME || "";
const AFD_REQUIRED_HEADER_VALUE = process.env.AFD_REQUIRED_HEADER_VALUE || "";

// === Middlewares base ===
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// CORS con validación por callback
app.use(cors({
  origin(origin, callback) {
    // Requests sin origen (curl, health checks) se aceptan
    if (!origin) return callback(null, true);

    // Dev: si allowList vacía y estamos en dev, permite localhost:5173
    const effectiveAllowList = allowList.length
      ? allowList
      : (APP_ENV === "dev" ? ["http://localhost:5173"] : []);

    const allowed = effectiveAllowList.some(allowedOrigin => {
      // Coincidencia exacta; si quieres soportar subdominios, aquí puedes
      // agregar lógica con RegExp.
      return origin === allowedOrigin;
    });

    if (allowed) return callback(null, true);
    return callback(new Error(`CORS blocked: origin ${origin} is not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
}));

// Preflight rápido
app.options("*", (_req, res) => res.sendStatus(204));

// === Middleware: exigir header secreto de Front Door (no en dev) ===
function afdGuard(req, res, next) {
  // Solo se aplica si NO es dev y hay variables configuradas
  const enforce =
    APP_ENV !== "dev" &&
    AFD_REQUIRED_HEADER_NAME &&
    AFD_REQUIRED_HEADER_VALUE;

  if (!enforce) return next();

  const incoming = req.header(AFD_REQUIRED_HEADER_NAME);
  if (incoming && incoming === AFD_REQUIRED_HEADER_VALUE) return next();

  return res.status(403).json({
    error: "Forbidden",
    reason: "Missing or invalid Front Door secret header",
  });
}

// Aplica a toda la API (puedes moverlo a rutas específicas si prefieres)
app.use("/api", afdGuard);

// === Endpoints demo ===
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

// === Start ===
app.listen(PORT, () => {
  console.log(`[backend] listening on :${PORT} (env=${APP_ENV})`);
  console.log(`[backend] CORS allowList: ${allowList.length ? allowList.join(", ") : "(auto dev: http://localhost:5173)"}`);
  if (APP_ENV !== "dev") {
    console.log(`[backend] AFD header enforcement: ${AFD_REQUIRED_HEADER_NAME ? "ON" : "OFF (vars missing)"}`);
  }
});
