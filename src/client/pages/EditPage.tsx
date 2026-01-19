import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api.js";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "done">("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const item = await api.getItem(id!);
        setTitle(item.title);
        setDescription(item.description);
        setStatus(item.status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.updateItem(id!, { title, description, status });
      nav(`/items/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSaving(false);
    }
  }

  if (loading) return <div className="card subtle">Loading...</div>;

  return (
    <div className="card">
      <h1>Edit Item</h1>
      <form className="stack" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
        </label>

        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "done")}>
            <option value="active">active</option>
            <option value="done">done</option>
          </select>
        </label>

        {error ? <div className="alert">{error}</div> : null}

        <div className="row gap">
          <button className="btn" disabled={saving}>Save</button>
          <Link className="btn secondary" to={`/items/${id}`}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
