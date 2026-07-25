import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

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

// Sube un archivo a Firebase Storage y crea el mensaje con su URL de descarga
export async function sendFileMessage({ chatId, senderUid, file }) {
  const path = `chats/${chatId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  await addDoc(collection(db, "chats", chatId, "messages"), {
    sender: senderUid,
    text: "",
    fileURL: url,
    fileName: file.name,
    fileType: file.type,
    createdAt: serverTimestamp(),
  });
}
