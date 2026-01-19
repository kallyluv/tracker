import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import type { Item } from "../types.js";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const data = await api.getItem(id!);
        setItem(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    })();
  }, [id]);

  async function onDelete() {
    if (!confirm("Delete this item?")) return;
    try {
      await api.deleteItem(id!);
      nav("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown error");
    }
  }

  if (error) return <div className="card alert">{error}</div>;
  if (!item) return <div className="card subtle">Loading...</div>;

  return (
    <div className="stack">
      <div className="card">
        <div className="row spaceBetween">
          <h1>{item.title}</h1>
          <span className={`pill ${item.status === "done" ? "pillDone" : "pillActive"}`}>
            {item.status}
          </span>
        </div>

        <p style={{ whiteSpace: "pre-wrap" }}>{item.description}</p>

        <div className="subtle small">
          Created: {new Date(item.createdAt).toLocaleString()} • Updated: {new Date(item.updatedAt).toLocaleString()}
        </div>

        <div className="row gap">
          <Link className="btn" to={`/items/${item.id}/edit`}>Edit</Link>
          <button className="btn danger" onClick={onDelete}>Delete</button>
          <Link className="btn secondary" to="/">Back</Link>
        </div>
      </div>
    </div>
  );
}
