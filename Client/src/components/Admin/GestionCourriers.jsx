// GestionCourriers.jsx
import { useNavigate } from "react-router-dom";
import { Mail, Send, Archive, ChevronRight, FileText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const GestionCourriers = () => {
  const navigate = useNavigate();
  const { tokens, isLight } = useTheme();

  const SS = {
    text:    tokens.text    || (isLight ? "#0F2137" : "#F0F4F8"),
    textSec: tokens.textSec || (isLight ? "#4A6780" : "#7A8FA6"),
    textDim: tokens.textDim || (isLight ? "#8FA8C0" : "#3D5166"),
    card:    tokens.card    || (isLight ? "#FFFFFF"  : "#161E28"),
    border:  tokens.border  || (isLight ? "#E2E8F0"  : "rgba(255,255,255,0.07)"),
  };

  const MODULES = [
    {
      id:          "arrives",
      label:       "Courriers Arrivés",
      description: "Réception, enregistrement et circulation des courriers entrants",
      icon:        Mail,
      color:       "#009A44",
      colorPale:   isLight ? "#E8FFF3" : "rgba(0,154,68,0.1)",
      colorBorder: isLight ? "rgba(0,154,68,0.3)" : "rgba(0,154,68,0.25)",
      path:        "/courriersArrives",
    },
    {
      id:          "sortants",
      label:       "Courriers Sortants",
      description: "Rédaction, validation et envoi des courriers officiels",
      icon:        Send,
      color:       "#2563EB",
      colorPale:   isLight ? "#EFF6FF" : "rgba(37,99,235,0.1)",
      colorBorder: isLight ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.25)",
      path:        "/courriersSortants",
    },
    {
      id:          "archives",
      label:       "Archives",
      description: "Consultation, recherche et gestion des documents archivés",
      icon:        Archive,
      color:       "#CE1126",
      colorPale:   isLight ? "#FFF0F2" : "rgba(206,17,38,0.1)",
      colorBorder: isLight ? "rgba(206,17,38,0.3)" : "rgba(206,17,38,0.25)",
      path:        "/archives",
    },
  ];

  return (
    <div style={{ fontFamily:"inherit",color:SS.text }}>

      {/* En-tête */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:SS.textDim,marginBottom:10 }}>
          <FileText size={13} color={SS.textDim}/>
          <span>Secrétariat DG</span>
          <ChevronRight size={11} color={SS.textDim}/>
          <span style={{ color:"#009A44",fontWeight:700 }}>Gestion des courriers</span>
        </div>

        <h1 style={{ fontSize:28,fontWeight:900,color:SS.text,margin:"0 0 6px",letterSpacing:"-0.02em" }}>
          Gestion des Courriers
        </h1>
        <p style={{ fontSize:14,color:SS.textSec,margin:"0 0 16px" }}>
          Sélectionnez un module pour accéder à la gestion correspondante
        </p>

        {/* Séparateur tricolore */}
        <div style={{ display:"flex",height:3,borderRadius:1,overflow:"hidden",maxWidth:180 }}>
          <div style={{ flex:1,background:"#CE1126" }}/>
          <div style={{ flex:1,background:"#FCD116" }}/>
          <div style={{ flex:1,background:"#009A44" }}/>
        </div>
      </div>

      {/* Grille */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20 }}>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.id} onClick={()=>navigate(mod.path)}
              style={{ background:SS.card,border:`1.5px solid ${mod.colorBorder}`,borderRadius:16,padding:"28px 24px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 12px 32px ${mod.color}20`; e.currentTarget.style.borderColor=mod.color; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=mod.colorBorder; }}
            >
              <div style={{ width:52,height:52,borderRadius:14,background:mod.colorPale,border:`1.5px solid ${mod.colorBorder}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18 }}>
                <Icon size={24} color={mod.color} strokeWidth={1.8}/>
              </div>
              <h2 style={{ fontSize:17,fontWeight:800,color:SS.text,margin:"0 0 8px",letterSpacing:"-0.01em" }}>{mod.label}</h2>
              <p style={{ fontSize:13,color:SS.textSec,margin:"0 0 20px",lineHeight:1.5 }}>{mod.description}</p>
              <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:12.5,fontWeight:700,color:mod.color }}>
                Accéder <ChevronRight size={14} strokeWidth={2.5}/>
              </div>
              <div style={{ position:"absolute",bottom:-20,right:-20,width:90,height:90,borderRadius:"50%",background:mod.colorPale,pointerEvents:"none" }}/>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GestionCourriers;