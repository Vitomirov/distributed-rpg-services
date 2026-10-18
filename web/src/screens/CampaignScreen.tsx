import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, characterApi } from "../api/client";
import type { Encounter, Student } from "../api/types";
import { MISSIONS } from "../campaign/missions";
import { clearMission, clearToken, getCleared, getStudentId, getToken } from "../session";
import { DuelStage } from "../stage/DuelStage";
import { placeForMission, propForClass } from "../stage/poses";

export function CampaignScreen() {
  const navigate = useNavigate();
  const studentId = getStudentId();
  const token = getToken();
  const [student, setStudent] = useState<Student | null>(null);
  const [cleared, setCleared] = useState<string[]>(() => (studentId ? getCleared(studentId) : []));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    if (!studentId) {
      navigate("/student", { replace: true });
      return;
    }
    setCleared(getCleared(studentId));
    characterApi
      .request<Student>(`/api/character/${studentId}`, { token })
      .then(setStudent)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) navigate("/", { replace: true });
        else setError(err instanceof ApiError ? err.message : "Lik se nije učitao");
      });
  }, [navigate, studentId, token]);

  const current = MISSIONS.find((mission) => !cleared.includes(mission.id));

  async function continueStory() {
    if (!studentId || !current || current.kind !== "story") return;
    clearMission(studentId, current.id);
    setCleared(getCleared(studentId));
  }

  async function goToSquare() {
    if (!token || !current?.template) return;
    setBusy(true);
    setError(null);
    try {
      const encounter = await characterApi.request<Encounter>("/api/character/encounter", {
        token,
        body: { template: current.template },
      });
      navigate(`/duel?mission=${current.id}&defender=${encounter.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Aktivista se nije pojavio");
    } finally {
      setBusy(false);
    }
  }

  const gear = (student?.items ?? [])
    .map((row) => row.item?.name)
    .filter((name): name is string => Boolean(name));

  if (!student && !error) {
    return (
      <main className="sheet">
        <p className="lede">Kolona se skuplja.</p>
      </main>
    );
  }

  return (
    <main className="sheet">
      <header className="topbar">
        <div>
          <p className="eyebrow">{student?.characterClass?.name ?? "Lista"}</p>
          <h1>{student?.name ?? "Kolona"}</h1>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            clearToken();
            navigate("/");
          }}
        >
          Izlaz
        </button>
      </header>
      {gear.length > 0 && <p className="gear">Kod tebe: {gear.join(", ")}</p>}
      <ol className="missions">
        {MISSIONS.map((mission) => {
          const done = cleared.includes(mission.id);
          const active = current?.id === mission.id;
          return (
            <li key={mission.id} className={done ? "done" : active ? "active" : "waiting"}>
              <strong>{mission.title}</strong>
              {active && (
                <>
                  <div className="beat-card">
                    <DuelStage
                      place={placeForMission(mission.id)}
                      clip="idle"
                      studentProp={propForClass(student?.characterClass?.name)}
                      showActivist={mission.kind === "duel"}
                      compact
                    />
                  </div>
                  <p>{mission.body}</p>
                  {mission.kind === "story" ? (
                    <button type="button" onClick={continueStory}>Dalje</button>
                  ) : (
                    <button type="button" onClick={goToSquare} disabled={busy}>Na trg</button>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
      {!current && <p className="lede">Lista je prošla noć. Trg je ostao vaš.</p>}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
