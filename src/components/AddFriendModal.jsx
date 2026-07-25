import React, { useState } from "react";
import { ArrowLeft, Search, Send } from "lucide-react";
import Avatar from "./Avatar";
import { findUserByCode } from "../lib/auth";
import { sendFriendRequest } from "../lib/friends";

export default function AddFriendModal({ me, onClose }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [found, setFound] = useState(null);
  const [status, setStatus] = useState(null); // null | "sent" | "pending" | "accepted"

  async function handleSearch() {
    setError("");
    setFound(null);
    setStatus(null);
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError("Ingresa un código válido");
      return;
    }
    if (trimmed === me.code) {
      setError("Ese es tu propio código");
      return;
    }
    setLoading(true);
    try {
      const user = await findUserByCode(trimmed);
      if (!user) {
        setError("No encontramos a nadie con ese código");
      } else {
        setFound(user);
      }
    } catch (e) {
      setError("Ocurrió un error, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest() {
    setLoading(true);
    try {
      const result = await sendFriendRequest({
        fromUid: me.uid,
        fromName: me.name,
        toUid: found.uid,
        toName: found.name,
      });
      setStatus(result === "pending" ? "sent" : result);
    } catch (e) {
      setError("No se pudo enviar la solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(43,38,30,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
      <div style={{ width: 340, background: "#fff", borderRadius: 18, padding: 26, animation: "fadeUp 0.25s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <ArrowLeft size={18} style={{ cursor: "pointer" }} onClick={onClose} />
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 600, color: "#2B261E", margin: 0 }}>
            Agregar amigo
          </h2>
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#5A5347" }}>Código del amigo</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 10 }}>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setFound(null); setStatus(null); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ej. A7K92X"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #EFEBE2", background: "#F7F5F1", outline: "none", fontSize: 15, letterSpacing: 2, textTransform: "uppercase", color: "#2B261E" }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ width: 44, borderRadius: 12, border: "none", background: "#2E7D6B", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Search size={17} />
          </button>
        </div>

        {error && <p style={{ color: "#C0392B", fontSize: 12, margin: "0 0 10px" }}>{error}</p>}

        {found && (
          <div style={{ marginTop: 8, padding: 16, borderRadius: 14, background: "#F7F5F1", border: "1px solid #EFEBE2", animation: "fadeUp 0.2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Avatar name={found.name} size={46} />
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 15, color: "#2B261E" }}>{found.name}</div>
                <div style={{ fontSize: 12, color: "#A8A192" }}>Código {found.code}</div>
              </div>
            </div>

            {status === "sent" && (
              <p style={{ fontSize: 12.5, color: "#2E7D6B", fontWeight: 600, margin: 0 }}>Solicitud enviada ✓</p>
            )}
            {status === "accepted" && (
              <p style={{ fontSize: 12.5, color: "#2E7D6B", fontWeight: 600, margin: 0 }}>Ya son amigos</p>
            )}
            {status === "rejected" && (
              <p style={{ fontSize: 12.5, color: "#A8A192", margin: 0 }}>Solicitud ya respondida</p>
            )}
            {!status && (
              <button
                onClick={handleSendRequest}
                disabled={loading}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#2E7D6B", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Poppins', sans-serif" }}
              >
                <Send size={14} />
                Enviar solicitud de amistad
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
