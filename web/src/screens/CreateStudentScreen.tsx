import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, characterApi } from "../api/client";
import type { GameClass } from "../api/types";
import { getToken, setStudentId } from "../session";
import { Figure } from "../stage/Figure";
import { propForClass } from "../stage/poses";

export function CreateStudentScreen() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<GameClass[]>([]);
  const [classId, setClassId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    characterApi
      .request<GameClass[]>("/api/classes", { token })
      .then((rows) => {
        const students = rows.filter((row) => row.template);
        setClasses(students);
        if (students[0]) setClassId(students[0].id);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Klase se nisu učitale");
      });
  }, []);

  const selected = classes.find((row) => row.id === classId);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const created = await characterApi.request<{ id: string }>("/api/character", {
        token,
        body: { name, characterClassId: classId },
      });
      setStudentId(created.id);
      navigate("/campaign");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lik nije sačuvan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sheet">
      <p className="eyebrow">Plenum</p>
      <h1>Izaberi ulogu</h1>
      <form onSubmit={onSubmit} className="stack">
        <label>
          Ime na listi
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <div className="roles">
          {classes.map((row) => (
            <label key={row.id} className={row.id === classId ? "role selected" : "role"}>
              <input
                type="radio"
                name="role"
                value={row.id}
                checked={row.id === classId}
                onChange={() => setClassId(row.id)}
              />
              <strong>{row.name}</strong>
              <span>{row.description}</span>
            </label>
          ))}
        </div>
        {selected && (
          <div className="actor preview-actor" data-side="student" data-pose="idle">
            <Figure skin="student" pose="idle" prop={propForClass(selected.name)} facing="right" />
          </div>
        )}
        {selected?.template && (
          <dl className="preview">
            <div><dt>Moral</dt><dd>{selected.template.health}</dd></div>
            <div><dt>Zvižduk / Zid</dt><dd>{selected.template.attack}</dd></div>
            <div><dt>Čaša vode</dt><dd>{selected.template.heal}</dd></div>
          </dl>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy || !classId}>
          Stani u kolonu
        </button>
      </form>
    </main>
  );
}
