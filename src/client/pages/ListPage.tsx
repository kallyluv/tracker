import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import type { Item, ListParams } from "../types.js";

export default function ListPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p: ListParams = {};
    if (status !== "all") p.status = status;
    if (q.trim()) p.q = q.trim();
    return p;
  }, [status, q]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.listItems(params);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [params]);

  return (
    <div className="stack">
      <div className="card">
        <h1>Items</h1>
        <p className="subtle">A simple tracker app. Filter, search, and manage items.</p>

        <div className="row gap">
          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label className="field grow">
            <span>Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="title or description..."
            />
          </label>

          <button className="btn secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        {error ? <div className="alert">{error}</div> : null}
      </div>

      <div className="card">
        {loading ? (
          <div className="subtle">Loading...</div>
        ) : items.length === 0 ? (
          <div className="subtle">No items found.</div>
        ) : (
          <ul className="list">
            {items.map((item) => (
              <li key={item.id} className="listItem">
                <div className="listMain">
                  <Link to={`/items/${item.id}`} className="titleLink">
                    {item.title}
                  </Link>
                  <div className="subtle small">
                    Status: <strong>{item.status}</strong> • Updated: {new Date(item.updatedAt).toLocaleString()}
                  </div>
                </div>
                <span className={`pill ${item.status === "done" ? "pillDone" : "pillActive"}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
