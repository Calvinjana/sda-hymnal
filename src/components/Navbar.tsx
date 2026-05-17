import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        background: "var(--navy)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 0",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #C9A84C, #E8D48B)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "var(--navy)",
            fontWeight: 700,
          }}
        >
          ✝
        </div>
        <div>
          <div style={{ color: "#E8D48B", fontSize: 17, fontWeight: 600 }}>
            SDA Hymnal
          </div>
          <div style={{ color: "rgba(232,212,139,0.5)", fontSize: 11 }}>
            Seventh-day Adventist
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {[
          { label: "Home", path: "/" },
          { label: "English", path: "/english" },
          { label: "Telugu", path: "/telugu" },
        ].map((link) => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              background:
                location.pathname === link.path
                  ? "rgba(201,168,76,0.2)"
                  : "transparent",
              border: "none",
              color:
                location.pathname === link.path
                  ? "#E8D48B"
                  : "rgba(232,212,139,0.6)",
              padding: "8px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
