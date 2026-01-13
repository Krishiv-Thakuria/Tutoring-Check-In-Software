export interface Student {
  id: number;
  name: string;
  first_seen: string; // ISO string
}

export interface CheckInRow {
  id: number;
  student_id: number;
  check_in_time: string; // ISO string
  check_out_time: string | null; // ISO string or null
  rating: number | null;
}

export interface CheckedInStudent {
  id: number;
  name: string;
  first_seen: string;
  check_in_id: number;
  check_in_time: string;
}

const KEY_STUDENTS = 'twss_students_v1';
const KEY_CHECKINS = 'twss_checkins_v1';
const KEY_NEXT_STUDENT_ID = 'twss_next_student_id_v1';
const KEY_NEXT_CHECKIN_ID = 'twss_next_checkin_id_v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function nextId(key: string) {
  const current = Number(window.localStorage.getItem(key) ?? '1');
  const next = Number.isFinite(current) && current > 0 ? current : 1;
  window.localStorage.setItem(key, String(next + 1));
  return next;
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

export function listStudents(limit = 50): Student[] {
  const students = readJson<Student[]>(KEY_STUDENTS, []);
  return [...students].sort((a, b) => (a.first_seen < b.first_seen ? 1 : -1)).slice(0, limit);
}

export function searchStudents(query: string, limit = 20): Student[] {
  const q = normalizeName(query);
  if (!q) return [];
  const students = readJson<Student[]>(KEY_STUDENTS, []);
  return students
    .filter((s) => normalizeName(s.name).includes(q))
    .sort((a, b) => (a.first_seen < b.first_seen ? 1 : -1))
    .slice(0, limit);
}

export function listCheckedIn(): CheckedInStudent[] {
  const students = readJson<Student[]>(KEY_STUDENTS, []);
  const checkins = readJson<CheckInRow[]>(KEY_CHECKINS, []);

  const byStudentId = new Map<number, Student>();
  for (const s of students) byStudentId.set(s.id, s);

  return checkins
    .filter((c) => c.check_out_time === null)
    .sort((a, b) => (a.check_in_time < b.check_in_time ? 1 : -1))
    .map((c) => {
      const s = byStudentId.get(c.student_id);
      return {
        id: s?.id ?? c.student_id,
        name: s?.name ?? 'Unknown',
        first_seen: s?.first_seen ?? c.check_in_time,
        check_in_id: c.id,
        check_in_time: c.check_in_time,
      };
    });
}

export function checkIn(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Name is required');
  }

  const students = readJson<Student[]>(KEY_STUDENTS, []);
  const checkins = readJson<CheckInRow[]>(KEY_CHECKINS, []);

  const normalized = normalizeName(trimmed);
  let student = students.find((s) => normalizeName(s.name) === normalized);

  if (!student) {
    student = { id: nextId(KEY_NEXT_STUDENT_ID), name: trimmed, first_seen: nowIso() };
    students.push(student);
  }

  const active = checkins.find((c) => c.student_id === student!.id && c.check_out_time === null);
  if (active) {
    throw new Error('Student is already checked in');
  }

  const checkInRow: CheckInRow = {
    id: nextId(KEY_NEXT_CHECKIN_ID),
    student_id: student.id,
    check_in_time: nowIso(),
    check_out_time: null,
    rating: null,
  };
  checkins.push(checkInRow);

  writeJson(KEY_STUDENTS, students);
  writeJson(KEY_CHECKINS, checkins);

  return {
    success: true,
    student,
    checkIn: { id: checkInRow.id, check_in_time: checkInRow.check_in_time },
  };
}

export function checkOut(checkInId: number, rating: number) {
  if (!checkInId) throw new Error('Check-in ID is required');
  if (!rating || rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const students = readJson<Student[]>(KEY_STUDENTS, []);
  const checkins = readJson<CheckInRow[]>(KEY_CHECKINS, []);

  const idx = checkins.findIndex((c) => c.id === checkInId);
  if (idx === -1) throw new Error('Check-in not found');

  const row = checkins[idx];
  row.check_out_time = nowIso();
  row.rating = rating;
  checkins[idx] = row;

  writeJson(KEY_CHECKINS, checkins);

  const student = students.find((s) => s.id === row.student_id);
  return {
    success: true,
    student: { id: student?.id ?? row.student_id, name: student?.name ?? 'Unknown' },
    checkOut: { check_out_time: row.check_out_time, rating: row.rating },
  };
}

