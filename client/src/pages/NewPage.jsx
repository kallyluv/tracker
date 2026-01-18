import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

export default function NewPage() {
  const nav = useNavigate();

  // This state represents the title text entered by the user.
  // It changes when the user types in the title input, and the UI updates automatically.
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // This state represents whether the new entry should be marked as important.
  // When it changes, the UI updates the ON/OFF display automatically.
  const [isImportant, setIsImportant] = useState(false);

  async function onSubmit(e) {
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
      setError(err.message);
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
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
