// GestionPersonnel.jsx — Hub RH
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar, Shield, BarChart3,
  ChevronRight, Loader2, TrendingUp,
  UserCheck, UserX, AlertTriangle, Coins,
} from "lucide-react";
import CONFIG from "../../config/config.js";
import { useTheme } from "../../context/ThemeContext";

const token   = () => localStorage.getItem("access");
const authHdr = () => ({ Authorization: `Bearer ${token()}` });
const fmtGNF  = (v) => { try { return `${parseFloat(v).toLocaleString("fr-FR")} GNF`; } catch { return "—"; } };

const mkSS = (tokens, isLight) => ({
  bg:           tokens.bg          || (isLight ? "#F5F7FA"             : "#080C10"),
  surface:      tokens.surface     || (isLight ? "#F5F7FA"             : "#111820"),
  card:         tokens.card        || (isLight ? "#FFFFFF"              : "#161E28"),
  hover:        isLight ? "#F0F4F8" : "#1A2535",
  text:         tokens.text        || (isLight ? "#0F2137"             : "#F0F4F8"),
  textSec:      tokens.textSec     || (isLight ? "#4A6780"             : "#7A8FA6"),
  textDim:      tokens.textDim     || (isLight ? "#8FA8C0"             : "#3D5166"),
  border:       tokens.border      || (isLight ? "#E2E8F0"             : "rgba(255,255,255,0.07)"),
  accent:       "#009A44",
  accentBg:     isLight ? "#E8FFF3"             : "rgba(0,154,68,0.1)",
  accentBorder: isLight ? "rgba(0,154,68,0.35)" : "rgba(0,154,68,0.3)",
  accentGlow:   "rgba(0,154,68,0.12)",
  isLight,
});

const GestionPersonnel = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();
  const SS = mkSS(tokens, isLight);

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CONFIG.API_RH_STATS, { headers: authHdr() })
      .then(r => r.json()).then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const modules = [
    {
      title: "Personnel",
      desc:  "Dossiers agents, fonctionnaires & contractuels",
      icon:  Users,
      color: "#009A44",
      bg:    "rgba(0,154,68,0.1)",
      border:"rgba(0,154,68,0.3)",
      path:  "/personnel",
      badge: stats ? `${stats.total_personnel} agents` : null,
    },
    {
      title: "Congés",
      desc:  "Demandes, validation, soldes & autorisations",
      icon:  Calendar,
      color: "#2563EB",
      bg:    "rgba(37,99,235,0.1)",
      border:"rgba(37,99,235,0.3)",
      path:  "/conges",
      badge: stats && stats.conges_en_attente > 0 ? `${stats.conges_en_attente} en attente` : null,
      alert: stats && stats.conges_en_attente > 0,
    },
    {
      title: "Assurance Maladie",
      desc:  "Suivi des affiliations et couvertures",
      icon:  Shield,
      color: "#C9A000",
      bg:    "rgba(201,160,0,0.1)",
      border:"rgba(201,160,0,0.3)",
      path:  "/assurances",
      badge: null,
    },
    {
      title: "Tableau de Bord",
      desc:  "KPIs, statistiques et alertes RH",
      icon:  BarChart3,
      color: "#CE1126",
      bg:    "rgba(206,17,38,0.1)",
      border:"rgba(206,17,38,0.3)",
      path:  "/rh/dashboard",
      badge: stats && stats.cnss_expires > 0 ? `${stats.cnss_expires} alertes` : null,
      alert: stats && stats.cnss_expires > 0,
    },
  ];

  const kpis = stats ? [
    { label:"Total Personnel", value:stats.total_personnel, icon:Users,        color:"#009A44" },
    { label:"Fonctionnaires",  value:stats.fonctionnaires,  icon:UserCheck,    color:"#2563EB" },
    { label:"Contractuels",    value:stats.contractuels,    icon:UserCheck,    color:"#C9A000" },
    { label:"Agents actifs",   value:stats.actifs,          icon:UserCheck,    color:"#009A44" },
    { label:"Congés en attente",value:stats.conges_en_attente,icon:Calendar,   color:"#F59E0B" },
    { label:"CNSS expirés",    value:stats.cnss_expires,    icon:AlertTriangle,color:"#CE1126" },
  ] : [];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text }}>
      <style>{`@keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* En-tête */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>
          Ressources Humaines
        </h1>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:6,height:6,borderRadius:"50%",background:SS.accent,boxShadow:`0 0 8px ${SS.accent}` }}/>
          <span style={{ fontSize:13,color:SS.textSec }}>
            Institut National de la Statistique — Gestion du Personnel
          </span>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:28,color:SS.textDim,fontSize:13 }}>
          <Loader2 size={16} style={{ animation:"spin 0.8s linear infinite" }}/> Chargement des statistiques…
        </div>
      ) : stats && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:14,marginBottom:32,animation:"pageIn 0.2s ease" }}>
          {kpis.map(({ label, value, icon:I, color }) => (
            <div key={label} style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:12,padding:"16px 18px",transition:"transform 0.15s,box-shadow 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,0.08)`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
            >
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <div style={{ width:32,height:32,borderRadius:8,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <I size={15} color={color}/>
                </div>
              </div>
              <div style={{ fontSize:24,fontWeight:900,color,marginBottom:4 }}>{value}</div>
              <div style={{ fontSize:11,color:SS.textDim,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Masse salariale */}
      {stats && (
        <div style={{ background:SS.card,border:`1px solid ${SS.accentBorder}`,borderRadius:14,padding:"18px 22px",marginBottom:32,display:"flex",alignItems:"center",gap:16,position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"3px",background:"linear-gradient(90deg,#CE1126,#FCD116,#009A44)" }}/>
          <div style={{ width:44,height:44,borderRadius:12,background:SS.accentBg,border:`1px solid ${SS.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Coins size={20} color={SS.accent}/>
          </div>
          <div>
            <div style={{ fontSize:10,color:SS.textDim,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4 }}>Masse salariale mensuelle</div>
            <div style={{ fontSize:22,fontWeight:900,color:SS.accent }}>{fmtGNF(stats.masse_salariale)}</div>
          </div>
        </div>
      )}

      {/* Modules */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:18,animation:"pageIn 0.25s ease" }}>
        {modules.map((m) => {
          const I = m.icon;
          return (
            <div key={m.title} onClick={() => navigate(m.path)}
              style={{ background:SS.card,border:`1px solid ${SS.border}`,borderRadius:16,padding:"24px 22px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden" }}
              onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${m.border}`;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 36px ${m.color}18`;}}
              onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${SS.border}`;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}
            >
              {/* Barre colorée top */}
              <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:m.color,borderRadius:"16px 16px 0 0" }}/>

              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16 }}>
                <div style={{ width:48,height:48,borderRadius:13,background:m.bg,border:`1px solid ${m.border}`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <I size={22} color={m.color}/>
                </div>
                {m.badge && (
                  <span style={{ fontSize:10,fontWeight:800,padding:"4px 10px",borderRadius:20,background:m.alert?"rgba(206,17,38,0.1)":m.bg,color:m.alert?"#CE1126":m.color,border:`1px solid ${m.alert?"rgba(206,17,38,0.3)":m.border}` }}>
                    {m.badge}
                  </span>
                )}
              </div>

              <div style={{ fontSize:16,fontWeight:800,color:SS.text,marginBottom:6 }}>{m.title}</div>
              <div style={{ fontSize:12,color:SS.textSec,lineHeight:1.5,marginBottom:16 }}>{m.desc}</div>

              <div style={{ display:"flex",alignItems:"center",gap:4,color:m.color,fontSize:12,fontWeight:700 }}>
                Accéder <ChevronRight size={14}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GestionPersonnel;