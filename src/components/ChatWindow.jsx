import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, UserPlus } from "lucide-react";
import Avatar from "./Avatar";
import { watchMessages, sendMessage } from "../lib/messages";

export default function ChatWindow({ chat, me }) {
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FBFAF7" }}>
      <div style={{ padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #EFEBE2", background: "#FFFFFF" }}>
        <Avatar name={otherName} size={40} />
        <div style={{ fontSize: 15, fontWeight: 600, color: "#2B261E", fontFamily: "'Poppins', sans-serif" }}>{otherName}</div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: 10, backgroundImage: "radial-gradient(circle, #EEEAE0 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", color: "#B7B0A0", fontSize: 13, marginTop: 20 }}>Envía el primer mensaje a {otherName}</div>
        )}
        {msgs.map((m) => {
          const mine = m.sender === me.uid;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "62%",
                  padding: "9px 13px",
                  borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: mine ? "#2E7D6B" : "#FFFFFF",
                  color: mine ? "#FDFBF7" : "#2B261E",
                  boxShadow: mine ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
                  fontSize: 14.5,
                  lineHeight: 1.4,
                }}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #EFEBE2", background: "#FFFFFF" }}>
        <Paperclip size={19} color="#9C9585" style={{ cursor: "pointer" }} />
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
