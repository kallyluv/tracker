export interface Item {
	id: string;
	title: string;
	description: string;
	status: "active" | "done";
	createdAt: string;
	updatedAt: string;
}

export interface ItemCreatePayload {
	title: string;
	description: string;
	status: "active" | "done";
}

export interface ItemUpdatePayload {
	title?: string;
	description?: string;
	status?: "active" | "done";
}

export interface ListParams {
	status?: string;
	q?: string;
}

// ─────────────────────────────────────────────────────────────
// Auth Types
// ─────────────────────────────────────────────────────────────

export interface User {
	id: number;
	email: string;
	name: string;
	createdAt: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	email: string;
	name: string;
	password: string;
}
