export type CurrentStudent = { id: string; name: string; className: string };

const KEY = "fingerCave.student";

export function saveStudent(student: CurrentStudent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(student));
  } catch {
    // localStorage may be unavailable (private mode); the app still works within one page load.
  }
}

export function loadStudent(): CurrentStudent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CurrentStudent) : null;
  } catch {
    return null;
  }
}
