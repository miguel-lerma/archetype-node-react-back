import express from "express";
const app = express();
const PORT = process.env.PORT || 8080;
app.get("/healthz", (req, res) => res.type("text/plain").send("ok"));
app.get("/hello", (req, res) => res.json({ message: "Hola desde el backend 👋", time: new Date().toISOString() }));
app.listen(PORT, () => console.log(`[backend] listening on :${PORT}`));
