import React from "react";
import { Check, X } from "lucide-react";
import Avatar from "./Avatar";
import { respondFriendRequest } from "../lib/friends";

export default function RequestsPanel({ requests }) {
  if (requests.length === 0) return null;

  return (
    <div style={{ padding: "0 18px 14px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#A8A192", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Solicitudes ({requests.length})
      </div>
      {requests.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#F2EFE8", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
          <Avatar name={r.fromName} size={34} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#2B261E" }}>{r.fromName}</div>
          <button
            onClick={() => respondFriendRequest(r.id, true)}
            style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#2E7D6B", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => respondFriendRequest(r.id, false)}
            style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: "#E7E2D8", color: "#5A5347", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
