import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Star, CheckCircle, Sparkles } from "lucide-react";

// ✅ Charte alignée sur BoutiquePage
const SS = {
  bg:        "#FFFFFF",
  surface:   "#FDFAF4",
  card:      "#F7F2E8",
  border:    "#EDE5CC",
  gold:      "#C9A84C",
  goldLight: "#8A6A20",
  goldDark:  "#5C3D00",
  text:      "#1A1208",
  textMuted: "#8A6A20",
  textDim:   "#C8A85A",
  success:   "#1A6B3C",
  successBg: "#D4EDDF",
};

const WAIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.643a.5.5 0 0 0 .61.61l5.788-1.471A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.57-5.33-1.548l-.383-.232-3.968 1.01 1.01-3.968-.232-.383A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const ouvrirWA = () => {
  const msg = encodeURIComponent("Bonjour Santa'Style ! 👋\nJe souhaite en savoir plus sur votre équipe.");
  window.open(`https://wa.me/224620762508?text=${msg}`, "_blank");
};

// ✅ Avatar initiales — adapté charte blanche
const Avatar = ({ initiales, couleur }) => (
  <div style={{
    width: "80px", height: "80px", borderRadius: "50%",
    background: `linear-gradient(135deg, ${couleur}CC, ${couleur})`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "24px", fontWeight: "900", color: "#fff",
    border: `3px solid #fff`,
    boxShadow: `0 4px 16px ${couleur}35`,
    flexShrink: 0,
  }}>
    {initiales}
  </div>
);

export default function NotreEquipe() {
  const navigate = useNavigate();

  const membres = [
    {
      initiales: "SS",
      couleur: "#C9A84C",
      nom: "Direction & Fondation",
      role: "Fondatrice & Directrice",
      // ✅ Phrase sans mention de pays
      phrase: "\"Ma vision depuis 2021 : rendre la mode de qualité accessible à toutes et tous à Conakry.\"",
      tags: ["Vision", "Sélection", "Stratégie"],
    },
    {
      initiales: "SC",
      couleur: "#8A6A20",
      nom: "Style & Collections",
      role: "Responsable Collections",
      // ✅ Phrase sans mention de pays
      phrase: "\"Je parcours nos partenaires internationaux pour vous dénicher les plus belles pièces exclusives.\"",
      tags: ["Mode", "Sourcing", "Tendances"],
    },
    {
      initiales: "SR",
      couleur: "#5C3D00",
      nom: "Service Client",
      role: "Relation Client & Livraison",
      phrase: "\"Votre satisfaction est ma priorité. De la commande à la livraison, je m'assure que tout se passe parfaitement.\"",
      tags: ["WhatsApp", "Livraison", "Suivi"],
    },
  ];

  const engagements = [
    {
      icon: <Star size={22} color={SS.gold} />,
      iconBg: `${SS.gold}15`,
      titre: "Sélection rigoureuse",
      texte: "Chaque article passe par un contrôle qualité strict avant d'intégrer notre boutique. Nous refusons ce qui ne nous satisfait pas nous-mêmes.",
    },
    {
      icon: <Heart size={22} color="#be185d" />,
      iconBg: "rgba(236,72,153,0.1)",
      titre: "Service personnalisé",
      texte: "Nous prenons le temps de comprendre votre style, votre morphologie et vos préférences pour vous conseiller au mieux.",
    },
    {
      icon: <CheckCircle size={22} color={SS.success} />,
      iconBg: "rgba(26,107,60,0.1)",
      titre: "Satisfaction garantie",
      texte: "Échange possible sous 24h. Nous assumons nos responsabilités et faisons tout pour que vous repartiez satisfait(e).",
    },
    {
      icon: <ShoppingBag size={22} color="#1d4ed8" />,
      iconBg: "rgba(59,130,246,0.1)",
      titre: "Toujours à l'écoute",
      texte: "Disponibles 7j/7 sur WhatsApp, nous répondons rapidement à chaque question, même les plus petites.",
    },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans, sans-serif)", background: SS.bg, color: SS.text, minHeight: "100vh" }}>

      {/* ── Hero blanc avec titre dégradé — même structure que BoutiquePage ── */}
      <div style={{ paddingTop: "100px", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px", textAlign: "center", position: "relative", overflow: "hidden", background: SS.bg, borderBottom: `1px solid ${SS.border}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${SS.gold}12 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 16px", borderRadius: "20px", background: `${SS.gold}12`, border: `1px solid ${SS.gold}35`, fontSize: "11px", color: SS.goldLight, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", fontWeight: "700" }}>
            <Sparkles size={11} color={SS.gold} /> Les visages derrière Santa'Style
          </div>

          {/* ✅ Titre dégradé or — identique BoutiquePage */}
          <h1 style={{ fontSize: "46px", fontWeight: "900", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            <span style={{ background: "linear-gradient(135deg, #8A6A20, #C9A84C, #E8C96A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Notre</span>
            <span style={{ color: SS.text }}> Équipe</span>
          </h1>

          <p style={{ fontSize: "17px", color: SS.textMuted, lineHeight: 1.75, margin: "0 0 32px", fontWeight: "400" }}>
            Derrière chaque article et chaque commande, une équipe passionnée entièrement dédiée à vous offrir la meilleure expérience shopping de Conakry.
          </p>

          {/* Barre infos — même style que BoutiquePage */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "20px", padding: "12px 28px", borderRadius: "40px", background: SS.surface, border: `1px solid ${SS.border}`, fontSize: "13px", color: SS.textMuted, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
              Disponibles 7j/7
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>💬 WhatsApp</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>🚚 Livraison Conakry</span>
          </div>
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "52px 24px 72px" }}>

        {/* ── Membres ── */}
        <div style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "11px", color: SS.goldLight, fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>Qui nous sommes</div>
            <h2 style={{ fontSize: "30px", fontWeight: "900", color: SS.text, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Une équipe à votre service</h2>
            <p style={{ fontSize: "15px", color: SS.textMuted, maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
              Chaque membre apporte son expertise unique pour garantir que votre expérience Santa'Style soit exceptionnelle, du choix de l'article jusqu'à la livraison.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {membres.map((m, i) => (
              <div key={i}
                style={{ background: "#fff", borderRadius: "20px", padding: "28px", border: `1px solid ${SS.border}`, transition: "all 0.25s", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = SS.gold; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px rgba(201,168,76,0.12)`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = SS.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; }}>

                {/* Header carte */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
                  <Avatar initiales={m.initiales} couleur={m.couleur} />
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: SS.text, marginBottom: "3px" }}>{m.nom}</div>
                    <div style={{ fontSize: "12px", color: SS.gold, fontWeight: "700" }}>{m.role}</div>
                  </div>
                </div>

                {/* Phrase signature */}
                <div style={{ padding: "12px 14px", borderRadius: "10px", background: SS.surface, border: `1px solid ${SS.border}`, marginBottom: "16px" }}>
                  <p style={{ fontSize: "13px", color: SS.textMuted, lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>{m.phrase}</p>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {m.tags.map((tag, j) => (
                    <span key={j} style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: `${SS.gold}12`, border: `1px solid ${SS.gold}25`, color: SS.goldLight }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nos engagements ── */}
        <div style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ fontSize: "11px", color: SS.goldLight, fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>Ce que nous promettons</div>
            <h2 style={{ fontSize: "30px", fontWeight: "900", color: SS.text, margin: "0 0 12px", letterSpacing: "-0.02em" }}>Nos engagements</h2>
            <p style={{ fontSize: "15px", color: SS.textMuted, maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
              Depuis 2021, ces engagements guident chacune de nos actions au quotidien.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {engagements.map((e, i) => (
              <div key={i} style={{ padding: "24px", borderRadius: "16px", background: "#fff", border: `1px solid ${SS.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)", transition: "all 0.2s" }}
                onMouseEnter={el => { el.currentTarget.style.borderColor = SS.gold; el.currentTarget.style.transform = "translateY(-3px)"; el.currentTarget.style.boxShadow = `0 8px 24px rgba(201,168,76,0.12)`; }}
                onMouseLeave={el => { el.currentTarget.style.borderColor = SS.border; el.currentTarget.style.transform = "none"; el.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.04)"; }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: e.iconBg, border: `1px solid ${SS.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                  {e.icon}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: SS.text, marginBottom: "8px" }}>{e.titre}</div>
                <div style={{ fontSize: "13px", color: SS.textMuted, lineHeight: 1.7 }}>{e.texte}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA final — même style footer que BoutiquePage ── */}
        <div style={{ padding: "40px 36px", borderRadius: "20px", background: SS.surface, border: `1px solid ${SS.border}`, textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: SS.goldLight, fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>Rejoignez notre communauté</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: SS.goldDark, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Ils nous font confiance depuis 2021
          </h2>
          <p style={{ fontSize: "14px", color: SS.textMuted, margin: "0 0 28px", maxWidth: "480px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
            Des centaines de clients satisfaits font confiance à Santa'Style pour leur garde-robe. Rejoignez une communauté qui aime la mode autant que vous.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/boutique")}
              style={{ padding: "13px 28px", borderRadius: "12px", background: `linear-gradient(135deg, ${SS.goldLight}, ${SS.gold})`, border: "none", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(201,168,76,0.3)", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <ShoppingBag size={16} /> Visiter la boutique
            </button>
            <button onClick={ouvrirWA}
              style={{ padding: "13px 28px", borderRadius: "12px", background: "#25D366", border: "none", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 16px rgba(37,211,102,0.3)", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <WAIcon size={16} /> Nous écrire
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}