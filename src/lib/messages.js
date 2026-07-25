import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

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

// Sube el archivo a Cloudinary con progreso real (0-100), usando XHR en vez de fetch
// porque fetch no reporta avance de subida.
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      reject(new Error("Falta configurar Cloudinary (revisa el .env)"));
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("No se pudo subir el archivo"));
      }
    };
    xhr.onerror = () => reject(new Error("No se pudo subir el archivo"));

    xhr.send(form);
  });
}

export async function sendFileMessage({ chatId, senderUid, file, onProgress }) {
  const data = await uploadToCloudinary(file, onProgress);

  await addDoc(collection(db, "chats", chatId, "messages"), {
    sender: senderUid,
    text: "",
    fileURL: data.secure_url,
    fileName: file.name,
    fileType: file.type,
    createdAt: serverTimestamp(),
  });
}
