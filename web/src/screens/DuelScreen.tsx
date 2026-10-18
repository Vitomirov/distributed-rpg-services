import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, characterApi, combatApi } from "../api/client";
import type { DuelView, Student } from "../api/types";
import { findMission } from "../campaign/missions";
import { MoralBar } from "../components/MoralBar";
import { clearMission, getStudentId, getToken } from "../session";
import { DuelStage, type MoraleFloat } from "../stage/DuelStage";
import {
  CLIP_MS,
  placeForMission,
  poseForAction,
  poseForEnemy,
  propForClass,
  wait,
  type ActionName,
  type Pose,
  type PropKind,
} from "../stage/poses";

const COOLDOWN_MS: Record<ActionName, number> = {
  attack: 1000,
  heal: 2000,
};

const challenges = new Map<string, Promise<DuelView>>();

function challengeOnce(defenderId: string, attackerId: string, token: string) {
  const existing = challenges.get(defenderId);
  if (existing) return existing;
  const promise = combatApi.request<DuelView>("/api/combat/challenge", {
    token,
    body: { attackerId, defenderId },
  });
  challenges.set(defenderId, promise);
  return promise;
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function moraleFloat(before: DuelView, after: DuelView, id: number): MoraleFloat | null {
  const student = (after.attackerHp ?? 0) - (before.attackerHp ?? 0);
  const activist = (after.defenderHp ?? 0) - (before.defenderHp ?? 0);
  if (student !== 0) return { id, side: "student", text: signed(student) };
  if (activist !== 0) return { id, side: "activist", text: signed(activist) };
  return null;
}

export function DuelScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const missionId = params.get("mission") ?? "";
  const defenderId = params.get("defender") ?? "";
  const mission = findMission(missionId);
  const studentId = getStudentId();
  const token = getToken();

  const [duel, setDuel] = useState<DuelView | null>(null);
  const [maxHp, setMaxHp] = useState({ attacker: 1, defender: 1 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Record<ActionName, number>>({ attack: 0, heal: 0 });
  const [clip, setClip] = useState<Pose>("idle");
  const [float, setFloat] = useState<MoraleFloat | null>(null);
  const [gear, setGear] = useState<string[]>([]);
  const [studentProp, setStudentProp] = useState<PropKind>("whistle");
  const floatId = useRef(0);

  useEffect(() => {
    if (!token || !studentId || !defenderId) {
      navigate("/campaign", { replace: true });
      return;
    }
    let cancelled = false;
    challengeOnce(defenderId, studentId, token)
      .then((next) => {
        if (cancelled) return;
        setDuel(next);
        setMaxHp({
          attacker: next.attackerHp ?? 1,
          defender: next.defenderHp ?? 1,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Duel nije počeo");
      });
    characterApi
      .request<Student>(`/api/character/${studentId}`, { token })
      .then((student) => {
        if (cancelled) return;
        setStudentProp(propForClass(student.characterClass?.name));
        setGear(itemNames(student));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [defenderId, navigate, studentId, token]);

  const finished = duel?.status === "FINISHED" || duel?.status === "DRAW";
  const won = duel?.status === "FINISHED" && duel.winnerId === studentId;

  function lock(action: ActionName) {
    const until = Date.now() + COOLDOWN_MS[action];
    setLockedUntil((current) => ({ ...current, [action]: until }));
    window.setTimeout(() => {
      setLockedUntil((current) => ({ ...current, [action]: 0 }));
    }, COOLDOWN_MS[action]);
  }

  function showFloat(before: DuelView, after: DuelView) {
    floatId.current += 1;
    setFloat(moraleFloat(before, after, floatId.current));
  }

  async function play(next: Pose) {
    setClip(next);
    await wait(CLIP_MS[next]);
  }

  async function refreshGear() {
    if (!token || !studentId) return;
    const student = await characterApi.request<Student>(`/api/character/${studentId}`, { token });
    setGear(itemNames(student));
  }

  async function finishClip(view: DuelView) {
    if (view.status === "DRAW") {
      await play("dim");
      return;
    }
    if (view.winnerId === studentId) {
      await play("leave");
      return;
    }
    await play("retreat");
  }

  async function act(action: ActionName) {
    if (!token || !duel || finished || busy) return;
    setBusy(true);
    setError(null);
    const playerPose = poseForAction(action);
    const started = Date.now();
    setClip(playerPose);
    try {
      const afterPlayer = await combatApi.request<DuelView>(`/api/combat/${duel.id}/${action}`, {
        token,
        body: {},
      });
      const merged = mergeDuel(duel, afterPlayer);
      setDuel(merged);
      showFloat(duel, merged);
      lock(action);
      await wait(Math.max(0, CLIP_MS[playerPose] - (Date.now() - started)));
      if (merged.status === "IN_PROGRESS") {
        const afterEnemy = await combatApi.request<DuelView>(`/api/combat/${duel.id}/enemy-turn`, {
          token,
          body: {},
        });
        const next = mergeDuel(merged, afterEnemy);
        setDuel(next);
        showFloat(merged, next);
        await play(poseForEnemy(afterEnemy.enemyLabel));
        if (next.status === "IN_PROGRESS") setClip("idle");
        else {
          await refreshGear();
          await finishClip(next);
        }
      } else {
        await refreshGear();
        await finishClip(merged);
      }
    } catch (err) {
      setClip("idle");
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 429) lock(action);
      }
    } finally {
      setBusy(false);
    }
  }

  function leave(markClear: boolean) {
    if (markClear && studentId && missionId) clearMission(studentId, missionId);
    navigate("/campaign");
  }

  const now = Date.now();

  return (
    <main className="duel-screen">
      <header className="hud">
        {duel ? (
          <MoralBar
            label={duel.attackerName ?? "Ekipa"}
            value={duel.attackerHp ?? 0}
            max={maxHp.attacker}
            tone="student"
          />
        ) : <div />}
        <p className="hud-place">{mission?.title ?? "Trg"}</p>
        {duel ? (
          <MoralBar
            label={duel.defenderName ?? "Aktivista"}
            value={duel.defenderHp ?? 0}
            max={maxHp.defender}
            tone="activist"
          />
        ) : <div />}
      </header>
      <DuelStage
        place={placeForMission(missionId)}
        clip={clip}
        studentProp={studentProp}
        showActivist
        float={float}
      />
      {!finished && (
        <div className="actions">
          <button type="button" disabled={busy || now < lockedUntil.attack} onClick={() => act("attack")}>
            <span>Zvižduk / Zid</span>
            <small>linija</small>
          </button>
          <button type="button" disabled={busy || now < lockedUntil.heal} onClick={() => act("heal")}>
            <span>Čaša vode</span>
            <small>ekipa</small>
          </button>
        </div>
      )}
      {finished && (
        <section className="end-panel">
          {duel?.status === "DRAW" && <p>Trg se ispraznio.</p>}
          {won && <p>Ostao je na trgu. Uzeo si ono što je ispustio.</p>}
          {won && mission?.winCopy && <p className="win-copy">{mission.winCopy}</p>}
          {duel?.status === "FINISHED" && !won && (
            <p>Ekipa se povlači sa ovog susreta. Možeš ponovo, bez udarca.</p>
          )}
          {gear.length > 0 && <p className="gear">Kod tebe: {gear.join(", ")}</p>}
          <button type="button" onClick={() => leave(Boolean(won))}>
            {won ? "Nazad na listu" : "Povratak"}
          </button>
        </section>
      )}
      {error && <p className="error">{error}</p>}
    </main>
  );
}

function itemNames(student: Student) {
  return (student.items ?? [])
    .map((row) => row.item?.name)
    .filter((name): name is string => Boolean(name));
}

function mergeDuel(previous: DuelView, next: DuelView): DuelView {
  if (next.status === "DRAW" && next.attackerHp === undefined) {
    return { ...previous, status: "DRAW", message: next.message };
  }
  return { ...previous, ...next };
}
