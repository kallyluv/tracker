import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

export default function NewPage() {
  const nav = useNavigate();

  // This state represents the title text entered by the user.
  // It changes when the user types in the title input, and the UI updates automatically.
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "done">("active");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // This state represents whether the new entry should be marked as important.
  // When it changes, the UI updates the ON/OFF display automatically.
  const [isImportant, setIsImportant] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");


  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const created = await api.createItem({
        title,
        description,
        status,
      });
      nav(`/items/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h1>New Item</h1>

      <form className="stack" onSubmit={onSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short and clear"
          />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "done")}>
            <option value="active">active</option>
            <option value="done">done</option>
          </select>
        </label>

        {/* Checkbox UI */}
        <label style={{ display: "block", marginTop: 12 }}>
          <input
            type="checkbox"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
          />
          {" "}Mark as important
        </label>

        {/* ON / OFF display */}
        <p style={{ marginTop: 8 }}>
          Important is currently: <strong>{isImportant ? "ON" : "OFF"}</strong>
        </p>
        <div style={{ marginTop: 16 }}>
      <label>
        New tag:
    <input
      type="text"
      value={newTag}
      onChange={(e) => setNewTag(e.target.value)}
      style={{ marginLeft: 8 }}
    />
  </label>

  <button
    type="button"
    style={{ marginLeft: 8 }}
    onClick={() => {
      if (newTag.trim() !== "") {
        setTags([...tags, newTag.trim()]);
        setNewTag("");
      }
    }}
  >
      Add tag
    </button>
  </div>

    {tags.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <strong>Tags:</strong>
    <ul>
      {tags.map((tag, index) => (
        <li key={index}>{tag}</li>
      ))}
    </ul>
  </div>
)}


        {error ? <div className="alert">{error}</div> : null}

        <div className="row gap">
          <button className="btn" disabled={saving}>
            Create
          </button>
          <Link className="btn secondary" to="/">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
