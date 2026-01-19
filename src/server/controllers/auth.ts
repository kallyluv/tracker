import type { Request, Response, NextFunction } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, rowToUser } from "../db.js";
import type { UserRow, AuthPayload } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = "7d";

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

function validateRegisterInput(body: Record<string, unknown>) {
	const email = String(body.email ?? "").trim().toLowerCase();
	const name = String(body.name ?? "").trim();
	const password = String(body.password ?? "");

	const errors: string[] = [];

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		errors.push("Valid email is required.");
	}
	if (name.length < 2) errors.push("Name must be at least 2 characters.");
	if (password.length < 6) errors.push("Password must be at least 6 characters.");

	return { email, name, password, errors };
}

function validateLoginInput(body: Record<string, unknown>) {
	const email = String(body.email ?? "").trim().toLowerCase();
	const password = String(body.password ?? "");

	const errors: string[] = [];
	if (!email) errors.push("Email is required.");
	if (!password) errors.push("Password is required.");

	return { email, password, errors };
}

// ─────────────────────────────────────────────────────────────
// Token Helpers
// ─────────────────────────────────────────────────────────────

function signToken(payload: AuthPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token: string): AuthPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AuthPayload;
	} catch {
		return null;
	}
}

// ─────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
	const { email, name, password, errors } = validateRegisterInput(req.body);
	if (errors.length) {
		res.status(400).json({ error: errors.join(" ") });
		return;
	}

	// Check if email exists
	const [existing] = await pool.query<UserRow[]>("SELECT id FROM users WHERE email = ?", [email]);
	if (existing.length > 0) {
		res.status(409).json({ error: "Email already registered." });
		return;
	}

	const passwordHash = await bcrypt.hash(password, 10);

	const [result] = await pool.query<ResultSetHeader>(
		"INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
		[email, name, passwordHash]
	);

	const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE id = ?", [result.insertId]);
	const user = rowToUser(rows[0]!);
	const token = signToken({ userId: user.id, email: user.email });

	res.status(201).json({ user, token });
}

export async function login(req: Request, res: Response): Promise<void> {
	const { email, password, errors } = validateLoginInput(req.body);
	if (errors.length) {
		res.status(400).json({ error: errors.join(" ") });
		return;
	}

	const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email]);
	if (rows.length === 0) {
		res.status(401).json({ error: "Invalid credentials." });
		return;
	}

	const userRow = rows[0]!;
	const valid = await bcrypt.compare(password, userRow.password_hash);
	if (!valid) {
		res.status(401).json({ error: "Invalid credentials." });
		return;
	}

	const user = rowToUser(userRow);
	const token = signToken({ userId: user.id, email: user.email });

	res.json({ user, token });
}

export async function getMe(req: Request, res: Response): Promise<void> {
	const authPayload = (req as Request & { auth?: AuthPayload }).auth;
	if (!authPayload) {
		res.status(401).json({ error: "Not authenticated." });
		return;
	}

	const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE id = ?", [authPayload.userId]);
	if (rows.length === 0) {
		res.status(404).json({ error: "User not found." });
		return;
	}

	res.json(rowToUser(rows[0]!));
}

// ─────────────────────────────────────────────────────────────
// Auth Middleware
// ─────────────────────────────────────────────────────────────

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		res.status(401).json({ error: "Missing or invalid authorization header." });
		return;
	}

	const token = authHeader.slice(7);
	const payload = verifyToken(token);
	if (!payload) {
		res.status(401).json({ error: "Invalid or expired token." });
		return;
	}

	(req as Request & { auth: AuthPayload }).auth = payload;
	next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice(7);
		const payload = verifyToken(token);
		if (payload) {
			(req as Request & { auth: AuthPayload }).auth = payload;
		}
	}
	next();
}
