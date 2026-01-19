import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { checkConnection, initDatabase } from "./db.js";
import itemsRoutes from "./routes/items.js";
import authRoutes from "./routes/auth.js";

// ─────────────────────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static("../public"));

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
	const dbOk = await checkConnection();
	res.json({ ok: dbOk, server: "mysql", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);

// ─────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error("Server error:", err);
	res.status(500).json({ error: "Internal server error." });
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

export async function startServer() {
	try {
		await initDatabase();
		app.listen(PORT, () => {
			console.log(`API server running on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Failed to start server:", err);
		process.exit(1);
	}
}
