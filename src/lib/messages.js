import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function watchMessages(chatId, callback) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage({ chatId, senderUid, text }) {
  await addDoc(collection(db, "chats", chatId, "messages"), {
    sender: senderUid,
    text,
    createdAt: serverTimestamp(),
  });
}
