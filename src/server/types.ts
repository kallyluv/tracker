import type { RowDataPacket } from "mysql2/promise";

// ─────────────────────────────────────────────────────────────
// Item Types
// ─────────────────────────────────────────────────────────────

export interface Item {
	id: number;
	title: string;
	description: string;
	status: "active" | "done";
	createdAt: string;
	updatedAt: string;
}

export interface ItemRow extends RowDataPacket {
	id: number;
	title: string;
	description: string;
	status: "active" | "done";
	created_at: Date;
	updated_at: Date;
}

// ─────────────────────────────────────────────────────────────
// User / Auth Types
// ─────────────────────────────────────────────────────────────

export interface User {
	id: number;
	email: string;
	name: string;
	createdAt: string;
}

export interface UserRow extends RowDataPacket {
	id: number;
	email: string;
	name: string;
	password_hash: string;
	created_at: Date;
}

export interface AuthPayload {
	userId: number;
	email: string;
}

// ─────────────────────────────────────────────────────────────
// Validation Types
// ─────────────────────────────────────────────────────────────

export interface ValidationResult<T> {
	data: T;
	errors: string[];
}
