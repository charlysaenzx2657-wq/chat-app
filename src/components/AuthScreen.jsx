import React, { useState } from "react";
import { Mail, Copy, Check as CheckIcon } from "lucide-react";
import { registerUser, loginUser } from "../lib/auth";

export default function AuthScreen({ onDone }) {
  const [mode, setMode] = useState("register"); // "register" | "login"
  const [step, setStep] = useState("form"); // "form" | "code"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [myCode, setMyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.includes("@") || password.length < 6) {
      setError("Revisa tu correo y usa una contraseña de al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        const { code } = await registerUser({ email, password, name });
        setMyCode(code);
        setStep("code");
      } else {
        await loginUser({ email, password });
        onDone();
      }
    } catch (e) {
      setError(mapFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  }

  if (step === "code") {
    return (
      <Shell>
        <p style={{ fontSize: 13, color: "#8A8375", margin: "0 0 4px" }}>¡Listo, {name || email.split("@")[0]}!</p>
        <h1 style={heading}>Este es tu código de amigo</h1>
        <div style={{ background: "#F2EFE8", borderRadius: 14, padding: "20px 16px", marginBottom: 14, border: "1.5px dashed #D8D3C8", textAlign: "center" }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: 4, color: "#2E7D6B" }}>{myCode}</div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(myCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          style={secondaryBtn}
        >
          {copied ? <CheckIcon size={15} color="#2E7D6B" /> : <Copy size={15} />}
          {copied ? "Copiado" : "Copiar código"}
        </button>
        <p style={{ fontSize: 12.5, color: "#A8A192", margin: "0 0 20px", lineHeight: 1.5, textAlign: "center" }}>
          Compártelo con tus amigos. Solo ellos podrán encontrarte y enviarte una solicitud si lo ingresan.
        </p>
        <button onClick={onDone} style={primaryBtn}>
          Continuar
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "#2E7D6B", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Mail size={24} color="#fff" />
      </div>
      <h1 style={heading}>{mode === "register" ? "Crea tu cuenta" : "Inicia sesión"}</h1>
      <p style={{ fontSize: 13.5, color: "#8A8375", margin: "0 0 24px", lineHeight: 1.5 }}>
        {mode === "register"
          ? "Te daremos un código único para que tus amigos puedan encontrarte."
          : "Ingresa con tu correo y contraseña."}
      </p>

      {mode === "register" && (
        <>
          <label style={label}>Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" style={input} />
        </>
      )}

      <label style={label}>Correo electrónico</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" style={input} />

      <label style={label}>Contraseña</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Mínimo 6 caracteres"
        style={{ ...input, marginBottom: 8 }}
      />

      {error && <p style={{ color: "#C0392B", fontSize: 12.5, margin: "0 0 12px" }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, marginTop: 12 }}>
        {loading ? "Un momento..." : mode === "register" ? "Registrarme" : "Entrar"}
      </button>

      <p style={{ textAlign: "center", fontSize: 12.5, color: "#8A8375", marginTop: 16 }}>
        {mode === "register" ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <span
          onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
          style={{ color: "#2E7D6B", fontWeight: 600, cursor: "pointer" }}
        >
          {mode === "register" ? "Inicia sesión" : "Regístrate"}
        </span>
      </p>
    </Shell>
  );
}

function mapFirebaseError(code) {
  const map = {
    "auth/email-already-in-use": "Ese correo ya está registrado",
    "auth/invalid-email": "Correo inválido",
    "auth/weak-password": "La contraseña es muy débil",
    "auth/user-not-found": "No encontramos una cuenta con ese correo",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/invalid-credential": "Correo o contraseña incorrectos",
  };
  return map[code] || "Ocurrió un error, intenta de nuevo";
}

function Shell({ children }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: "#EDEAE3", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: 380, background: "#FFFFFF", borderRadius: 20, padding: "36px 32px", boxShadow: "0 20px 60px rgba(43,38,30,0.18)", animation: "fadeUp 0.4s ease" }}>
        {children}
      </div>
    </div>
  );
}

const heading = { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 600, color: "#2B261E", margin: "0 0 6px" };
const label = { fontSize: 12.5, fontWeight: 600, color: "#5A5347" };
const input = { width: "100%", marginTop: 6, marginBottom: 16, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #EFEBE2", background: "#F7F5F1", outline: "none", fontSize: 14, color: "#2B261E" };
const primaryBtn = { width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#2E7D6B", color: "#fff", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" };
const secondaryBtn = { width: "100%", padding: "11px", borderRadius: 12, border: "1.5px solid #E7E2D8", background: "#fff", color: "#5A5347", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 12 };
