import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, UserPlus, ArrowLeft, FileText, Download, X } from "lucide-react";
import Avatar from "./Avatar";
import { watchMessages, sendMessage, sendFileMessage } from "../lib/messages";

export default function ChatWindow({ chat, me, onBack }) {
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // archivo elegido, esperando confirmación
  const [uploadPct, setUploadPct] = useState(null); // null = no subiendo, 0-100 = progreso
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!chat) return;
    const unsub = watchMessages(chat.id, setMsgs);
    return unsub;
  }, [chat?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, pendingFile, uploadPct]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !chat) return;
    sendMessage({ chatId: chat.id, senderUid: me.uid, text });
    setDraft("");
  }

  function handleFilePicked(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es muy grande (máximo 10 MB)");
      return;
    }
    setPendingFile(file); // solo lo guarda, no lo manda todavía
  }

  async function confirmSendFile() {
    if (!pendingFile || !chat) return;
    setUploadPct(0);
    try {
      await sendFileMessage({
        chatId: chat.id,
        senderUid: me.uid,
        file: pendingFile,
        onProgress: setUploadPct,
      });
      setPendingFile(null);
    } catch (err) {
      alert("No se pudo enviar el archivo, intenta de nuevo");
    } finally {
      setUploadPct(null);
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
  const isImagePending = pendingFile?.type?.startsWith("image/");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FBFAF7", minWidth: 0, height: "100%" }}>
      <div className="chat-header" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #EFEBE2", background: "#FFFFFF", flexShrink: 0 }}>
        {onBack && (
          <ArrowLeft size={20} color="#5A5347" style={{ cursor: "pointer", flexShrink: 0 }} onClick={onBack} />
        )}
        <Avatar name={otherName} size={38} />
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "#2B261E", fontFamily: "'Poppins', sans-serif" }}>{otherName}</div>
      </div>

      <div ref={scrollRef} className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 8, backgroundImage: "radial-gradient(circle, #EEEAE0 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {msgs.length === 0 && !pendingFile && (
          <div style={{ textAlign: "center", color: "#B7B0A0", fontSize: 13, marginTop: 20 }}>Envía el primer mensaje a {otherName}</div>
        )}
        {msgs.map((m) => {
          const mine = m.sender === me.uid;
          const isImage = m.fileType?.startsWith("image/");
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", animation: "fadeUp 0.25s ease" }}>
              <div
                className="msg-bubble"
                style={{
                  maxWidth: "78%",
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
                    <img src={m.fileURL} alt={m.fileName} style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 10, display: "block" }} />
                  </a>
                )}
                {m.fileURL && !isImage && (
                  <a href={m.fileURL} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", textDecoration: "none", color: "inherit" }}>
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

        {/* Vista previa del archivo elegido, esperando confirmación */}
        {pendingFile && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "78%", width: 220, background: "#FFFFFF", borderRadius: 14, padding: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "1px solid #EFEBE2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {isImagePending ? (
                  <img src={URL.createObjectURL(pendingFile)} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: "#F2EFE8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={20} color="#8A8375" />
                  </div>
                )}
                <span style={{ fontSize: 12.5, color: "#2B261E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingFile.name}</span>
              </div>

              {uploadPct === null ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setPendingFile(null)}
                    style={{ flex: 1, padding: "8px", borderRadius: 9, border: "1.5px solid #E7E2D8", background: "#fff", color: "#5A5347", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <X size={13} /> Cancelar
                  </button>
                  <button
                    onClick={confirmSendFile}
                    style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", background: "#2E7D6B", color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                  >
                    <Send size={13} /> Enviar
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ height: 6, background: "#EFEBE2", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${uploadPct}%`, background: "#2E7D6B", transition: "width 0.15s ease" }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: "#8A8375", marginTop: 4, textAlign: "right" }}>{uploadPct}%</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="chat-input" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid #EFEBE2", background: "#FFFFFF", flexShrink: 0 }}>
        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFilePicked} />
        <Paperclip size={20} color="#9C9585" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => fileInputRef.current?.click()} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "#F2EFE8", borderRadius: 20, padding: "8px 12px", minWidth: 0 }}>
          <Smile size={18} color="#9C9585" style={{ flexShrink: 0 }} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, width: "100%", color: "#2B261E", minWidth: 0 }}
          />
        </div>
        <button onClick={handleSend} style={{ width: 38, height: 38, borderRadius: "50%", background: "#2E7D6B", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}
