import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, UserPlus, ArrowLeft, FileText, Download } from "lucide-react";
import Avatar from "./Avatar";
import { watchMessages, sendMessage, sendFileMessage } from "../lib/messages";

export default function ChatWindow({ chat, me, onBack }) {
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!chat) return;
    const unsub = watchMessages(chat.id, setMsgs);
    return unsub;
  }, [chat?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !chat) return;
    sendMessage({ chatId: chat.id, senderUid: me.uid, text });
    setDraft("");
  }

  async function handleFilePicked(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !chat) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es muy grande (máximo 10 MB)");
      return;
    }
    setUploading(true);
    try {
      await sendFileMessage({ chatId: chat.id, senderUid: me.uid, file });
    } catch (err) {
      alert("No se pudo enviar el archivo, intenta de nuevo");
    } finally {
      setUploading(false);
    }
  }

  if (!chat) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "#FBFAF7" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F2EFE8", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <UserPlus size={26} color="#B7B0A0" />
        </div>
        <p style={{ color: "#A8A192", fontSize: 13.5 }}>Agrega un amigo o selecciona un chat</p>
      </div>
    );
  }

  const otherName = chat.otherName || "Amigo";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FBFAF7", minWidth: 0 }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #EFEBE2", background: "#FFFFFF" }}>
        {onBack && (
          <ArrowLeft size={20} color="#5A5347" style={{ cursor: "pointer", flexShrink: 0 }} onClick={onBack} />
        )}
        <Avatar name={otherName} size={40} />
        <div style={{ fontSize: 15, fontWeight: 600, color: "#2B261E", fontFamily: "'Poppins', sans-serif" }}>{otherName}</div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 10, backgroundImage: "radial-gradient(circle, #EEEAE0 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", color: "#B7B0A0", fontSize: 13, marginTop: 20 }}>Envía el primer mensaje a {otherName}</div>
        )}
        {msgs.map((m) => {
          const mine = m.sender === me.uid;
          const isImage = m.fileType?.startsWith("image/");
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "62%",
                  padding: m.fileURL ? 6 : "9px 13px",
                  borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: mine ? "#2E7D6B" : "#FFFFFF",
                  color: mine ? "#FDFBF7" : "#2B261E",
                  boxShadow: mine ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
                  fontSize: 14.5,
                  lineHeight: 1.4,
                }}
              >
                {m.fileURL && isImage && (
                  <a href={m.fileURL} target="_blank" rel="noopener noreferrer">
                    <img
                      src={m.fileURL}
                      alt={m.fileName}
                      style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 10, display: "block" }}
                    />
                  </a>
                )}
                {m.fileURL && !isImage && (
                  <a
                    href={m.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", textDecoration: "none", color: "inherit" }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: mine ? "rgba(255,255,255,0.15)" : "#F2EFE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={17} />
                    </div>
                    <span style={{ fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.fileName}</span>
                    <Download size={15} style={{ flexShrink: 0 }} />
                  </a>
                )}
                {m.text && <div style={{ padding: m.fileURL ? "4px 7px 0" : 0 }}>{m.text}</div>}
              </div>
            </div>
          );
        })}
        {uploading && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "#2E7D6B", opacity: 0.6, borderRadius: "16px 16px 4px 16px", padding: "9px 13px", color: "#fff", fontSize: 13 }}>
              Enviando archivo...
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #EFEBE2", background: "#FFFFFF" }}>
        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFilePicked} />
        <Paperclip
          size={19}
          color="#9C9585"
          style={{ cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#F2EFE8", borderRadius: 20, padding: "9px 14px" }}>
          <Smile size={18} color="#9C9585" style={{ flexShrink: 0 }} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, width: "100%", color: "#2B261E" }}
          />
        </div>
        <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: "50%", background: "#2E7D6B", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
}
