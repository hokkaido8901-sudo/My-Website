import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

export type CompetitionCategory =
  | "coding"
  | "sports"
  | "art"
  | "science"
  | "music"
  | "debate";
export type CompetitionStatus = "upcoming" | "active" | "ended";
export type UserRole = "student" | "admin";

export interface CompetitionWinners {
  first?: string;   // uid
  second?: string;  // uid
  third?: string;   // uid
}

export interface Competition {
  id?: string;
  title: string;
  description: string;
  category: CompetitionCategory;
  status: CompetitionStatus;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  maxParticipants: number;
  currentParticipants: number;
  createdBy: string;
  createdAt?: Timestamp;
  prize?: string;
  rules?: string;
  winners?: CompetitionWinners;
}

export interface UserProfile {
  id?: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  points: number;
  rank?: number;
  participations: number;
  wins: number;
  badges: string[];
  createdAt?: Timestamp;
}

export interface Registration {
  id?: string;
  userId: string;
  competitionId: string;
  registeredAt?: Timestamp;
  status: "registered" | "withdrawn";
  score?: number;
}

export interface ActivityItem {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: "registration" | "win" | "achievement" | "competition_created";
  description: string;
  competitionId?: string;
  competitionTitle?: string;
  createdAt?: Timestamp;
}

const COMPETITIONS = "competitions";
const USERS = "users";
const REGISTRATIONS = "registrations";
const ACTIVITY = "activity";

export const competitionsRef = () => collection(db, COMPETITIONS);
export const usersRef = () => collection(db, USERS);
export const registrationsRef = () => collection(db, REGISTRATIONS);
export const activityRef = () => collection(db, ACTIVITY);

export async function getCompetitions(): Promise<Competition[]> {
  const q = query(competitionsRef(), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Competition));
}

export async function getActiveCompetitions(): Promise<Competition[]> {
  const q = query(
    competitionsRef(),
    where("status", "in", ["active", "upcoming"]),
    orderBy("startDate", "asc"),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Competition));
}

export async function createCompetition(
  data: Omit<Competition, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(competitionsRef(), {
    ...data,
    currentParticipants: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCompetition(
  id: string,
  data: Partial<Competition>
): Promise<void> {
  await updateDoc(doc(db, COMPETITIONS, id), data);
}

export async function deleteCompetition(id: string): Promise<void> {
  await deleteDoc(doc(db, COMPETITIONS, id));
}

export async function setCompetitionWinners(
  competitionId: string,
  competitionTitle: string,
  winners: CompetitionWinners,
  prevWinners?: CompetitionWinners
): Promise<void> {
  const POINTS = { first: 300, second: 200, third: 100 };
  const BADGES = { first: "🥇 1-р байр", second: "🥈 2-р байр", third: "🥉 3-р байр" };

  // Revert previous winners' points if re-assigning
  if (prevWinners) {
    for (const place of ["first", "second", "third"] as const) {
      const uid = prevWinners[place];
      if (uid && uid !== winners[place]) {
        const prev = await getDoc(doc(db, USERS, uid));
        if (prev.exists()) {
          const d = prev.data() as UserProfile;
          await updateDoc(doc(db, USERS, uid), {
            points: Math.max(0, (d.points || 0) - POINTS[place]),
            wins: Math.max(0, (d.wins || 0) - 1),
          });
        }
      }
    }
  }

  // Apply new winners
  for (const place of ["first", "second", "third"] as const) {
    const uid = winners[place];
    if (!uid) continue;
    const snap = await getDoc(doc(db, USERS, uid));
    if (!snap.exists()) continue;
    const d = snap.data() as UserProfile;
    const badge = BADGES[place];
    const badges = Array.isArray(d.badges) ? d.badges : [];
    await updateDoc(doc(db, USERS, uid), {
      points: (d.points || 0) + POINTS[place],
      wins: (d.wins || 0) + 1,
      badges: badges.includes(badge) ? badges : [...badges, badge],
    });
    await addDoc(activityRef(), {
      userId: uid,
      userName: d.displayName,
      userPhoto: d.photoURL || null,
      type: "win",
      description: `"${competitionTitle}" тэмцээнд ${place === "first" ? "1-р" : place === "second" ? "2-р" : "3-р"} байр эзэллээ`,
      competitionId,
      competitionTitle,
      createdAt: serverTimestamp(),
    });
  }

  await updateDoc(doc(db, COMPETITIONS, competitionId), { winners });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "id" | "createdAt">
): Promise<void> {
  await updateDoc(doc(db, USERS, uid), {
    ...data,
    createdAt: serverTimestamp(),
  }).catch(async () => {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, USERS, uid), {
      ...data,
      createdAt: serverTimestamp(),
    });
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, USERS, uid), data);
}

export async function getLeaderboard(count = 20): Promise<UserProfile[]> {
  const q = query(usersRef(), orderBy("points", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({
    id: d.id,
    rank: i + 1,
    ...d.data(),
  } as UserProfile));
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(usersRef(), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
}

export async function registerForCompetition(
  userId: string,
  competitionId: string
): Promise<void> {
  await addDoc(registrationsRef(), {
    userId,
    competitionId,
    status: "registered",
    registeredAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COMPETITIONS, competitionId), {
    currentParticipants: increment(1),
  });
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  const q = query(registrationsRef(), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
}

export async function getCompetitionRegistrations(competitionId: string): Promise<Registration[]> {
  const q = query(registrationsRef(), where("competitionId", "==", competitionId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration));
}

export async function getRecentActivity(count = 10): Promise<ActivityItem[]> {
  const q = query(activityRef(), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityItem));
}

export async function addActivity(data: Omit<ActivityItem, "id" | "createdAt">): Promise<void> {
  await addDoc(activityRef(), { ...data, createdAt: serverTimestamp() });
}

export function subscribeToLeaderboard(
  callback: (users: UserProfile[]) => void
): () => void {
  const q = query(usersRef(), orderBy("points", "desc"), limit(20));
  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d, i) => ({
      id: d.id,
      rank: i + 1,
      ...d.data(),
    } as UserProfile));
    callback(users);
  });
}

export function subscribeToCompetitions(
  callback: (comps: Competition[]) => void
): () => void {
  const q = query(competitionsRef(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const comps = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Competition));
    callback(comps);
  });
}

export async function seedDemoData(adminUid: string): Promise<void> {
  const existing = await getDocs(query(competitionsRef(), limit(1)));
  if (!existing.empty) return;

  const now = Timestamp.now();
  const competitions = [
    {
      title: "Ухаалаг Програмчлалын Тэмцээн 2025",
      description: "Алгоритм болон өгөгдлийн бүтцийн ахисан түвшний тэмцээн",
      category: "coding" as CompetitionCategory,
      status: "active" as CompetitionStatus,
      startDate: now,
      endDate: new Timestamp(now.seconds + 7 * 86400, 0),
      maxParticipants: 100,
      currentParticipants: 47,
      createdBy: adminUid,
      prize: "500,000₮",
      rules: "Хувийн компьютерээр оролцох. Интернэт хэрэглэхгүй.",
    },
    {
      title: "Монголын Шинжлэх Ухааны Олимпиад",
      description: "Физик, Хими, Биологийн дунд шатны тэмцээн",
      category: "science" as CompetitionCategory,
      status: "upcoming" as CompetitionStatus,
      startDate: new Timestamp(now.seconds + 3 * 86400, 0),
      endDate: new Timestamp(now.seconds + 10 * 86400, 0),
      maxParticipants: 200,
      currentParticipants: 89,
      createdBy: adminUid,
      prize: "1,000,000₮",
      rules: "Дунд сургуулийн суралцагчид оролцох боломжтой.",
    },
    {
      title: "Уран Зургийн Наадам",
      description: "Дижитал болон гар урлалын уран зургийн тэмцээн",
      category: "art" as CompetitionCategory,
      status: "upcoming" as CompetitionStatus,
      startDate: new Timestamp(now.seconds + 5 * 86400, 0),
      endDate: new Timestamp(now.seconds + 15 * 86400, 0),
      maxParticipants: 150,
      currentParticipants: 34,
      createdBy: adminUid,
      prize: "300,000₮",
      rules: "Зөвхөн өөрийн бүтээл байх ёстой.",
    },
    {
      title: "Хөгжмийн Авьяасын Шоу",
      description: "Ард түмний дуу, орчин үеийн хөгжмийн тэмцээн",
      category: "music" as CompetitionCategory,
      status: "ended" as CompetitionStatus,
      startDate: new Timestamp(now.seconds - 14 * 86400, 0),
      endDate: new Timestamp(now.seconds - 7 * 86400, 0),
      maxParticipants: 80,
      currentParticipants: 80,
      createdBy: adminUid,
      prize: "200,000₮",
      rules: "Бүлгэмлэг оролцох боломжтой.",
    },
    {
      title: "Хэлэлцүүлгийн Чадварын Тэмцээн",
      description: "Монгол хэл дээрх илтгэлийн болон мэтгэлцээний тэмцээн",
      category: "debate" as CompetitionCategory,
      status: "active" as CompetitionStatus,
      startDate: now,
      endDate: new Timestamp(now.seconds + 5 * 86400, 0),
      maxParticipants: 60,
      currentParticipants: 28,
      createdBy: adminUid,
      prize: "250,000₮",
      rules: "Хоёр хүний баг.",
    },
  ];

  for (const comp of competitions) {
    await addDoc(competitionsRef(), { ...comp, createdAt: serverTimestamp() });
  }
}
