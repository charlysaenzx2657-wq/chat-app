import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I para evitar confusiones

function generateCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

async function codeExists(code) {
  const q = query(collection(db, "users"), where("code", "==", code));
  const snap = await getDocs(q);
  return !snap.empty;
}

async function generateUniqueCode() {
  let code = generateCode();
  let tries = 0;
  while (await codeExists(code) && tries < 10) {
    code = generateCode();
    tries++;
  }
  return code;
}

export async function registerUser({ email, password, name }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const code = await generateUniqueCode();

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    name: name || email.split("@")[0],
    code,
    createdAt: Date.now(),
  });

  return { uid: cred.user.uid, code };
}

export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Busca un usuario por su código de amigo (para la tarjeta de vista previa)
export async function findUserByCode(code) {
  const q = query(collection(db, "users"), where("code", "==", code.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
}
