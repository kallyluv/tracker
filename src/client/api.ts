/// <reference types="vite/client" />
import type { Item, ItemCreatePayload, ItemUpdatePayload, ListParams, User, AuthResponse } from "./types.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

async function http<T>(method: string, path: string, body?: unknown, token?: string): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers,
		body: body ? JSON.stringify(body) : null
	});

	if (res.status === 204) return null as T;

	const data = await res.json().catch(() => null);
	if (!res.ok) {
		const msg = (data as { error?: string })?.error || `Request failed: ${res.status}`;
		throw new Error(msg);
	}
	return data as T;
}

export const api = {
	// Health
	health: () => http<{ status: string }>("GET", "/api/health"),

	// Auth
	login: (email: string, password: string) =>
		http<AuthResponse>("POST", "/api/auth/login", { email, password }),
	register: (email: string, name: string, password: string) =>
		http<AuthResponse>("POST", "/api/auth/register", { email, name, password }),
	getMe: (token: string) =>
		http<User>("GET", "/api/auth/me", undefined, token),

	// Items
	listItems: (params: ListParams = {}) => {
		const qs = new URLSearchParams(params as Record<string, string>).toString();
		return http<Item[]>("GET", `/api/items${qs ? `?${qs}` : ""}`);
	},
	getItem: (id: string) => http<Item>("GET", `/api/items/${id}`),
	createItem: (payload: ItemCreatePayload) => http<Item>("POST", "/api/items", payload),
	updateItem: (id: string, payload: ItemUpdatePayload) => http<Item>("PUT", `/api/items/${id}`, payload),
	deleteItem: (id: string) => http<null>("DELETE", `/api/items/${id}`)
};
