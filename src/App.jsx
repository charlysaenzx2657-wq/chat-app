import React, { useState, useEffect } from "react";
import { MoreVertical, UserPlus } from "lucide-react";
import AuthScreen from "./components/AuthScreen";
import AddFriendModal from "./components/AddFriendModal";
import RequestsPanel from "./components/RequestsPanel";
import ChatWindow from "./components/ChatWindow";
import Avatar from "./components/Avatar";
import { watchAuthState, logoutUser } from "./lib/auth";
import { watchIncomingRequests, watchMyChats } from "./lib/friends";
import { db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    let unsubProfile = null;

    const unsubAuth = watchAuthState((u) => {
      setUser(u);
      setAuthChecked(true);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (u) {
        unsubProfile = onSnapshot(doc(db, "users", u.uid), (snap) => {
          setProfile(snap.exists() ? snap.data() : null);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    const unsub1 = watchIncomingRequests(profile.uid, setRequests);
    const unsub2 = watchMyChats(profile.uid, async (rawChats) => {
      const enriched = await Promise.all(
        rawChats.map(async (c) => {
          const otherUid = c.members.find((m) => m !== profile.uid);
          const snap = await getDoc(doc(db, "users", otherUid));
          return { ...c, otherName: snap.exists() ? snap.data().name : "Amigo" };
        })
      );
      setChats(enriched);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [profile?.uid]);

  if (!authChecked) return null;

  if (!user || !profile) {
    return (
      <>
        <GlobalStyles />
        <AuthScreen onDone={() => {}} />
      </>
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const showingChat = !!activeChat;

  return (
    <div style={{ width: "100%", height: "100vh", background: "#EDEAE3", display: "flex", justifyContent: "center", alignItems: "center", padding: 16 }}>
      <GlobalStyles />
      <div style={{ width: "100%", maxWidth: 480, height: "min(760px, 100%)", display: "flex", background: "#FFFFFF", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(43,38,30,0.18)", position: "relative" }}>
        {/* Lista de contactos: se oculta al abrir un chat */}
        <div
          style={{
            width: "100%",
            flexShrink: 0,
            background: "#F7F5F1",
            display: showingChat ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={profile.name} size={38} />
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 15, color: "#2B261E" }}>{profile.name}</div>
                <div style={{ fontSize: 10.5, color: "#A8A192" }}>Código: {profile.code}</div>
              </div>
            </div>
            <MoreVertical size={19} color="#8A8375" style={{ cursor: "pointer" }} onClick={logoutUser} />
          </div>

          <div style={{ padding: "0 18px 14px" }}>
            <button
              onClick={() => setShowAddFriend(true)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#2E7D6B", border: "none", borderRadius: 12, padding: "10px 12px", color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}
            >
              <UserPlus size={16} />
              Agregar amigo por código
            </button>
          </div>

          <RequestsPanel requests={requests} />

          <div style={{ flex: 1, overflowY: "auto" }}>
            {chats.length === 0 && (
              <div style={{ padding: "30px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#A8A192", lineHeight: 1.6 }}>
                  Aún no tienes amigos agregados. Usa el botón de arriba y pide el código de alguien para empezar a chatear.
                </p>
              </div>
            )}
            {chats.map((c, i) => (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", cursor: "pointer", animation: `fadeUp 0.25s ease ${i * 0.03}s backwards`, transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#EFECE5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Avatar name={c.otherName} />
                <span style={{ fontSize: 14.5, fontWeight: 600, color: "#2B261E", fontFamily: "'Poppins', sans-serif" }}>{c.otherName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat: solo se muestra cuando hay uno activo, con botón de regreso */}
        {showingChat && (
          <div style={{ width: "100%", display: "flex", animation: "slideIn 0.22s ease" }}>
            <ChatWindow chat={activeChat} me={profile} onBack={() => setActiveChatId(null)} />
          </div>
        )}

        {showAddFriend && <AddFriendModal me={profile} onClose={() => setShowAddFriend(false)} />}
      </div>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; font-family: 'Inter', sans-serif; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
      button { transition: transform 0.12s ease, opacity 0.12s ease; }
      button:active { transform: scale(0.96); }
      button:hover { opacity: 0.92; }
    `}</style>
  );
}
