// GestionCourriers.jsx
import { useNavigate } from "react-router-dom";
import { Mail, Send, Archive, ChevronRight, FileText } from "lucide-react";


// ── Palette INS-Guinée ────────────────────────────────────
const C = {
  rouge:      "#CE1126",
  jaune:      "#FCD116",
  vert:       "#009A44",
  vertLight:  "#00C457",
  vertPale:   "#E8FFF3",
  dark:       "#0F2137",
  textSec:    "#4A6780",
  textDim:    "#8FA8C0",
  border:     "#DDE4ED",
  surface:    "#F5F7FA",
  white:      "#FFFFFF",
};

const MODULES = [
  {
    id:          "arrives",
    label:       "Courriers Arrivés",
    description: "Réception, enregistrement et circulation des courriers entrants",
    icon:        Mail,
    color:       C.vert,
    colorPale:   C.vertPale,
    colorBorder: `${C.vert}30`,
    path:        "/courriersArrives",
    badge:       null,
  },
  {
    id:          "sortants",
    label:       "Courriers Sortants",
    description: "Rédaction, validation et envoi des courriers officiels",
    icon:        Send,
    color:       "#2563EB",
    colorPale:   "#EFF6FF",
    colorBorder: "#2563EB30",
    path:        "/secretariat/courriers/sortants",
    badge:       "Bientôt",
  },
  {
    id:          "archives",
    label:       "Archives",
    description: "Consultation et gestion des courriers archivés",
    icon:        Archive,
    color:       C.rouge,
    colorPale:   "#FFF0F2",
    colorBorder: `${C.rouge}30`,
    path:        "/secretariat/courriers/archives",
    badge:       "Bientôt",
  },
];

const GestionCourriers = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Calibri', sans-serif", color: C.dark }}>

      {/* ── En-tête ──────────────────────────────────────── */}
      <div style={{ marginBottom: "32px" }}>
        {/* Fil d'ariane */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          fontSize: "12px", color: C.textDim, marginBottom: "10px",
        }}>
          <FileText size={13} color={C.textDim}/>
          <span>Secrétariat DG</span>
          <ChevronRight size={12} color={C.textDim}/>
          <span style={{ color: C.vert, fontWeight: "700" }}>Gestion des courriers</span>
        </div>

        <h1 style={{
          fontSize: "26px", fontWeight: "900",
          color: C.dark, margin: "0 0 6px",
          letterSpacing: "-0.02em",
        }}>
          Gestion des Courriers
        </h1>
        <p style={{ fontSize: "14px", color: C.textSec, margin: 0 }}>
          Sélectionnez un module pour accéder à la gestion correspondante
        </p>

        {/* Séparateur tricolore */}
        <div style={{ display: "flex", gap: "5px", marginTop: "16px" }}>
          <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: C.rouge }}/>
          <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: C.jaune }}/>
          <div style={{ width: "32px", height: "3px", borderRadius: "2px", background: C.vert  }}/>
        </div>
      </div>

      {/* ── Grille des modules ────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
      }}>
        {MODULES.map((mod) => {
          const Icon      = mod.icon;
          const disabled  = !!mod.badge && mod.badge === "Bientôt";

          return (
            <div
              key={mod.id}
              onClick={() => !disabled && navigate(mod.path)}
              style={{
                background:   C.white,
                border:       `1.5px solid ${mod.colorBorder}`,
                borderRadius: "16px",
                padding:      "28px 24px",
                cursor:       disabled ? "not-allowed" : "pointer",
                opacity:      disabled ? 0.65 : 1,
                transition:   "all 0.2s",
                position:     "relative",
                overflow:     "hidden",
              }}
              onMouseEnter={e => {
                if (!disabled) {
                  e.currentTarget.style.transform   = "translateY(-3px)";
                  e.currentTarget.style.boxShadow   = `0 12px 32px ${mod.color}20`;
                  e.currentTarget.style.borderColor = mod.color;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform   = "none";
                e.currentTarget.style.boxShadow   = "none";
                e.currentTarget.style.borderColor = mod.colorBorder;
              }}
            >
              {/* Badge */}
              {mod.badge && (
                <span style={{
                  position:     "absolute", top: "14px", right: "14px",
                  fontSize:     "9px", fontWeight: "800",
                  letterSpacing:"0.08em", textTransform: "uppercase",
                  color:        mod.color,
                  background:   mod.colorPale,
                  border:       `1px solid ${mod.colorBorder}`,
                  borderRadius: "20px", padding: "3px 9px",
                }}>
                  {mod.badge}
                </span>
              )}

              {/* Icône */}
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: mod.colorPale,
                border: `1.5px solid ${mod.colorBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "18px",
              }}>
                <Icon size={24} color={mod.color} strokeWidth={1.8}/>
              </div>

              {/* Texte */}
              <h2 style={{
                fontSize: "17px", fontWeight: "800",
                color: C.dark, margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}>
                {mod.label}
              </h2>
              <p style={{ fontSize: "13px", color: C.textSec, margin: "0 0 20px", lineHeight: "1.5" }}>
                {mod.description}
              </p>

              {/* CTA */}
              {!disabled && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "12.5px", fontWeight: "700",
                  color: mod.color, letterSpacing: "0.03em",
                }}>
                  Accéder <ChevronRight size={14} strokeWidth={2.5}/>
                </div>
              )}

              {/* Fond décoratif cercle */}
              <div style={{
                position: "absolute", bottom: "-20px", right: "-20px",
                width: "90px", height: "90px", borderRadius: "50%",
                background: mod.colorPale,
                pointerEvents: "none",
              }}/>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default GestionCourriers;