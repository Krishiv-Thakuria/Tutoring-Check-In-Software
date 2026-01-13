import { apiUrl } from './api';
import * as local from './localStore';

type Mode = 'local' | 'api';

function getMode(): Mode {
  const envMode = (process.env.REACT_APP_DATA_MODE ?? '').toLowerCase();
  if (envMode === 'api') return 'api';
  if (envMode === 'local') return 'local';

  // Default behavior:
  // - If a backend base URL is provided, use API mode.
  // - Otherwise, use local browser storage (works on Vercel with no backend).
  return process.env.REACT_APP_API_BASE_URL ? 'api' : 'local';
}

async function apiGetJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  const data = (await res.json()) as T;
  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errMsg = (data as any)?.error ?? 'Request failed';
    throw new Error(errMsg);
  }
  return data;
}

async function apiPostJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T;
  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errMsg = (data as any)?.error ?? 'Request failed';
    throw new Error(errMsg);
  }
  return data;
}

export async function listCheckedIn() {
  if (getMode() === 'api') return apiGetJson<local.CheckedInStudent[]>('/api/checked-in');
  return local.listCheckedIn();
}

export async function searchStudents(query: string) {
  if (getMode() === 'api')
    return apiGetJson<local.Student[]>(`/api/students/search?q=${encodeURIComponent(query)}`);
  return local.searchStudents(query);
}

export async function listStudents() {
  if (getMode() === 'api') return apiGetJson<local.Student[]>('/api/students');
  return local.listStudents();
}

export async function checkIn(name: string) {
  if (getMode() === 'api') return apiPostJson('/api/checkin', { name });
  return local.checkIn(name);
}

export async function checkOut(checkInId: number, rating: number) {
  if (getMode() === 'api') return apiPostJson('/api/checkout', { checkInId, rating });
  return local.checkOut(checkInId, rating);
}

