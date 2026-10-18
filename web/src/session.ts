const TOKEN_KEY = "sl2026_token";
const STUDENT_KEY = "sl2026_student";

function clearedKey(studentId: string) {
  return `sl2026_cleared:${studentId}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStudentId(): string | null {
  return localStorage.getItem(STUDENT_KEY);
}

export function setStudentId(id: string) {
  localStorage.setItem(STUDENT_KEY, id);
}

export function getCleared(studentId: string): string[] {
  try {
    const raw = localStorage.getItem(clearedKey(studentId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function clearMission(studentId: string, missionId: string) {
  const next = new Set(getCleared(studentId));
  next.add(missionId);
  localStorage.setItem(clearedKey(studentId), JSON.stringify([...next]));
}
