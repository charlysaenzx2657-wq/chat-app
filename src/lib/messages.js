import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

// Datos de tu cuenta gratuita de Cloudinary (ver README para obtenerlos)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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

// Sube el archivo a Cloudinary (gratis, sin datos fiscales) y guarda el mensaje con su URL
export async function sendFileMessage({ chatId, senderUid, file }) {
  console.log("Cloudinary configurado:", Boolean(CLOUDINARY_CLOUD_NAME), Boolean(CLOUDINARY_UPLOAD_PRESET));

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Falta configurar Cloudinary (revisa el .env)");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    throw new Error("No se pudo subir el archivo");
  }

  const data = await res.json();

  await addDoc(collection(db, "chats", chatId, "messages"), {
    sender: senderUid,
    text: "",
    fileURL: data.secure_url,
    fileName: file.name,
    fileType: file.type,
    createdAt: serverTimestamp(),
  });
}
