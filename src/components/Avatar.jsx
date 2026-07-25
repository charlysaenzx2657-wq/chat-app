import React from "react";

function initialsOf(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const COLORS = ["#2E7D6B", "#4A5FA8", "#8E4585", "#B0562F", "#3B7A9E"];

function colorFor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ name, size = 44, online }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: colorFor(name),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 600,
          fontSize: size * 0.36,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {initialsOf(name)}
      </div>
      {online && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: "50%",
            background: "#3BC97F",
            border: "2.5px solid #F7F5F1",
          }}
        />
      )}
    </div>
  );
}
