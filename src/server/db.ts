import mysql, { type Pool } from "mysql2/promise";
import type { Item, ItemRow, User, UserRow } from "./types.js";

// ─────────────────────────────────────────────────────────────
// Pool
// ─────────────────────────────────────────────────────────────

export const pool: Pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT) || 3306,
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "tracker",
	waitForConnections: true,
	connectionLimit: 10,
});

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  status ENUM('active', 'done') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_items_status (status),
  INDEX idx_items_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export async function initDatabase(): Promise<void> {
	console.log("Initializing database...");

	const statements = SCHEMA
		.split(";")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

	for (const statement of statements) {
		await pool.query(statement);
	}

	console.log("Database initialized successfully.");
}

// ─────────────────────────────────────────────────────────────
// Row Converters
// ─────────────────────────────────────────────────────────────

export function rowToItem(row: ItemRow): Item {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		status: row.status,
		createdAt: row.created_at.toISOString(),
		updatedAt: row.updated_at.toISOString(),
	};
}

export function rowToUser(row: UserRow): User {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		createdAt: row.created_at.toISOString(),
	};
}

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────

export async function checkConnection(): Promise<boolean> {
	try {
		await pool.query("SELECT 1");
		return true;
	} catch {
		return false;
	}
}
