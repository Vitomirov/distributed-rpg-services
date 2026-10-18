import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { accountApi, ApiError, characterApi } from "../api/client";
import type { Student } from "../api/types";
import { getToken, setStudentId, setToken } from "../session";

export function AuthScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (getToken()) navigate("/campaign", { replace: true });
  }, [navigate]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "register") {
        await accountApi.request("/api/auth/register", {
          body: { username, password },
        });
      }
      const session = await accountApi.request<{ token: string }>("/api/auth/login", {
        body: { username, password },
      });
      setToken(session.token);
      const mine = await characterApi.request<Student[]>("/api/character/mine", {
        token: session.token,
      });
      if (mine.length > 0) {
        setStudentId(mine[0].id);
        navigate("/campaign");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Prijava nije uspela");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sheet">
      <p className="eyebrow">Studentska izborna lista</p>
      <h1>2026</h1>
      <p className="lede">
        Ulaziš na trg kao deo ekipe. Aktivista vređa i gura. Vi držite liniju, pevate i ne udarate.
      </p>
      <form onSubmit={onSubmit} className="stack">
        <label>
          Ime naloga
          <input value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label>
          Lozinka
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {mode === "login" ? "Uđi" : "Otvori nalog"}
        </button>
      </form>
      <button
        type="button"
        className="text-button"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Nemaš nalog? Otvori ga." : "Već imaš nalog? Uđi."}
      </button>
    </main>
  );
}
