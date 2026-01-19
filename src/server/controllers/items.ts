import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import { pool, rowToItem } from "../db.js";
import type { ItemRow } from "../types.js";

// ─────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────

function normalizeStatus(status: unknown): "active" | "done" {
	const s = String(status || "").toLowerCase();
	return s === "done" ? "done" : "active";
}

function validateItemInput(body: Record<string, unknown>) {
	const title = String(body.title ?? "").trim();
	const description = String(body.description ?? "").trim();
	const status = normalizeStatus(body.status);

	const errors: string[] = [];
	if (title.length < 2) errors.push("Title must be at least 2 characters.");
	if (title.length > 120) errors.push("Title must be 120 characters or fewer.");
	if (description.length > 2000) errors.push("Description must be 2000 characters or fewer.");

	return { title, description, status, errors };
}

// ─────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────

export async function listItems(req: Request, res: Response): Promise<void> {
	const status = req.query.status ? normalizeStatus(req.query.status) : null;
	const q = String(req.query.q ?? "").trim().toLowerCase();

	let sql = "SELECT * FROM items WHERE 1=1";
	const params: (string | number)[] = [];

	if (status) {
		sql += " AND status = ?";
		params.push(status);
	}
	if (q) {
		sql += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)";
		params.push(`%${q}%`, `%${q}%`);
	}

	sql += " ORDER BY updated_at DESC";

	const [rows] = await pool.query<ItemRow[]>(sql, params);
	res.json(rows.map(rowToItem));
}

export async function getItem(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);
	const [rows] = await pool.query<ItemRow[]>("SELECT * FROM items WHERE id = ?", [id]);

	if (rows.length === 0) {
		res.status(404).json({ error: "Item not found." });
		return;
	}
	res.json(rowToItem(rows[0]!));
}

export async function createItem(req: Request, res: Response): Promise<void> {
	const { title, description, status, errors } = validateItemInput(req.body);
	if (errors.length) {
		res.status(400).json({ error: errors.join(" ") });
		return;
	}

	const [result] = await pool.query<ResultSetHeader>(
		"INSERT INTO items (title, description, status) VALUES (?, ?, ?)",
		[title, description, status]
	);

	const [rows] = await pool.query<ItemRow[]>("SELECT * FROM items WHERE id = ?", [result.insertId]);
	res.status(201).json(rowToItem(rows[0]!));
}

export async function updateItem(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	const [existing] = await pool.query<ItemRow[]>("SELECT * FROM items WHERE id = ?", [id]);
	if (existing.length === 0) {
		res.status(404).json({ error: "Item not found." });
		return;
	}

	const { title, description, status, errors } = validateItemInput(req.body);
	if (errors.length) {
		res.status(400).json({ error: errors.join(" ") });
		return;
	}

	await pool.query(
		"UPDATE items SET title = ?, description = ?, status = ? WHERE id = ?",
		[title, description, status, id]
	);

	const [rows] = await pool.query<ItemRow[]>("SELECT * FROM items WHERE id = ?", [id]);
	res.json(rowToItem(rows[0]!));
}

export async function deleteItem(req: Request, res: Response): Promise<void> {
	const id = Number(req.params.id);

	const [result] = await pool.query<ResultSetHeader>("DELETE FROM items WHERE id = ?", [id]);

	if (result.affectedRows === 0) {
		res.status(404).json({ error: "Item not found." });
		return;
	}
	res.status(204).send();
}
