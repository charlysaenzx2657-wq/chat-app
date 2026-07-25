import {
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ID determinístico para que no se puedan crear solicitudes duplicadas
function requestId(fromUid, toUid) {
  return `${fromUid}_${toUid}`;
}

export async function sendFriendRequest({ fromUid, fromName, toUid, toName }) {
  const id = requestId(fromUid, toUid);
  const ref = doc(db, "friendRequests", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return existing.data().status; // "pending" | "accepted" | "rejected"
  }
  await setDoc(ref, {
    from: fromUid,
    fromName,
    to: toUid,
    toName,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return "pending";
}

export async function respondFriendRequest(requestId, accept) {
  const ref = doc(db, "friendRequests", requestId);
  await updateDoc(ref, { status: accept ? "accepted" : "rejected" });

  if (accept) {
    const snap = await getDoc(ref);
    const { from, to } = snap.data();
    // Creamos un chat compartido con id determinístico (orden alfabético de uids)
    const chatId = [from, to].sort().join("_");
    await setDoc(doc(db, "chats", chatId), {
      members: [from, to],
      createdAt: serverTimestamp(),
    });
  }
}

// Solicitudes recibidas, pendientes, para el usuario actual
export function watchIncomingRequests(uid, callback) {
  const q = query(
    collection(db, "friendRequests"),
    where("to", "==", uid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Amigos ya aceptados (chats donde participa el usuario)
export function watchMyChats(uid, callback) {
  const q = query(collection(db, "chats"), where("members", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
