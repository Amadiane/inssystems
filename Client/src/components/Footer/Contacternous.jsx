import React, { useState, useEffect } from "react";
import { MapPin, Clock, CheckCircle, Sparkles } from "lucide-react";
import track from "../../utils/tracker";

// ✅ Charte alignée sur NosMissions / BoutiquePage
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
  danger:    "#A32020",
  dangerBg:  "#FDEAEA",
};

// ✅ Chiffres uniquement, sans 00 au début — WhatsApp Web exige ce format
const NUMERO_WA = "224620762508";

const WAIcon = ({ size = 20, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.528 5.855L.057 23.643a.5.5 0 0 0 .61.61l5.788-1.471A11.941 11.941 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.791-.57-5.33-1.548l-.383-.232-3.968 1.01 1.01-3.968-.232-.383A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
);

const SUJETS = [
  { label: "Commander un article",       emoji: "🛍️", msg: "Bonjour Santa'Style !\nJe souhaite commander un article." },
  { label: "Disponibilité d'un article", emoji: "🔍", msg: "Bonjour Santa'Style !\nJe voudrais savoir si un article est disponible." },
  { label: "Suivi de commande",          emoji: "📦", msg: "Bonjour Santa'Style !\nJe souhaite suivre ma commande." },
  { label: "Demander un devis",          emoji: "💰", msg: "Bonjour Santa'Style !\nJe souhaite obtenir un devis." },
  { label: "Echange / Retour",           emoji: "🔄", msg: "Bonjour Santa'Style !\nJe souhaite effectuer un echange ou un retour." },
  { label: "Autre question",             emoji: "💬", msg: "Bonjour Santa'Style !\nJ'ai une question a vous poser." },
];

// ✅ api.whatsapp.com/send est plus fiable que wa.me pour le pré-remplissage du texte
const ouvrirWA = (msg) => {
  const texte = encodeURIComponent(msg);
  window.open(`https://api.whatsapp.com/send?phone=${NUMERO_WA}&text=${texte}`, "_blank");
};

// ✅ FAQ sans mention de pays
const faq = [
  { q: "Comment passer une commande ?",      r: "Choisissez votre article dans la boutique, cliquez sur \"Commander\" et vous serez redirigé vers notre WhatsApp. Nous confirmons votre commande en moins de 2h." },
  { q: "Livrez-vous à domicile ?",           r: "Oui, nous livrons à Conakry. Les frais et délais de livraison vous sont communiqués lors de la confirmation de commande sur WhatsApp." },
  { q: "Est-ce qu'on peut échanger un article ?", r: "Oui, l'échange est possible sous 24h après réception, si l'article est dans son état d'origine. Contactez-nous via WhatsApp." },
  { q: "Les prix incluent-ils la livraison ?", r: "Les prix affichés en boutique n'incluent pas la livraison. Le coût vous sera communiqué selon votre zone lors de la commande." },
  { q: "Quelle est la qualité de vos articles ?", r: "Chaque article est soigneusement sélectionné auprès de nos partenaires internationaux pour garantir qualité, originalité et conformité aux photos." },
];

export default function Contact() {
  useEffect(() => { track("visite_contact"); }, []);

  const [sujetChoisi, setSujetChoisi]               = useState(null);
  const [messagePersonnalise, setMessagePersonnalise] = useState("");
  const [nom, setNom]                               = useState("");
  const [envoye, setEnvoye]                         = useState(false);
  const [faqOuverte, setFaqOuverte]                 = useState(null);

  const handleEnvoyer = () => {
    // ✅ Fix : sujetChoisi peut valoir 0 (premier item), null = rien choisi
    if (sujetChoisi === null) return;

    const sujet = SUJETS[sujetChoisi];

    // ✅ Construction complète du message avec toutes les données
    let msgFinal = sujet.msg;
    if (nom.trim())                    msgFinal += `\n\nMon prénom : ${nom.trim()}`;
    if (messagePersonnalise.trim())    msgFinal += `\n\nDétails : ${messagePersonnalise.trim()}`;

    ouvrirWA(msgFinal);
    setEnvoye(true);
    setTimeout(() => setEnvoye(false), 4000);
  };

  const infos = [
    {
      icon: <WAIcon size={20} color={SS.gold} />,
      titre: "WhatsApp",
      valeur: "+224 620 762 508",
      sous: "Réponse en moins de 2h",
      action: () => ouvrirWA("Bonjour Santa'Style ! 👋"),
      actionLabel: "Écrire maintenant",
    },
    {
      icon: <MapPin size={20} color={SS.gold} />,
      titre: "Livraison",
      valeur: "Conakry",
      // ✅ Formulation recommandée — sans frais fixes affichés
      sous: "Frais calculés à la commande",
      action: null,
    },
    {
      icon: <Clock size={20} color={SS.gold} />,
      titre: "Disponibilité",
      valeur: "7 jours sur 7",
      sous: "De 8h à 22h",
      action: null,
    },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans, sans-serif)", background: SS.bg, color: SS.text, minHeight: "100vh" }}>

      {/* ── Hero blanc — même structure que NosMissions ── */}
      <div style={{ paddingTop: "100px", paddingBottom: "60px", paddingLeft: "24px", paddingRight: "24px", textAlign: "center", position: "relative", overflow: "hidden", background: SS.bg, borderBottom: `1px solid ${SS.border}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${SS.gold}12 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "640px", margin: "0 auto" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 16px", borderRadius: "20px", background: `${SS.gold}12`, border: `1px solid ${SS.gold}35`, fontSize: "11px", color: SS.goldLight, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "20px", fontWeight: "700" }}>
            <Sparkles size={11} color={SS.gold} /> Nous sommes là pour vous
          </div>

          {/* ✅ Titre dégradé or — même technique que NosMissions */}
          <h1 style={{ fontSize: "46px", fontWeight: "900", margin: "0 0 16px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            <span style={{ background: "linear-gradient(135deg, #8A6A20, #C9A84C, #E8C96A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Contactez</span>
            <span style={{ color: SS.text }}> notre équipe</span>
          </h1>

          <p style={{ fontSize: "17px", color: SS.textMuted, lineHeight: 1.75, margin: "0 0 36px", fontWeight: "400" }}>
            Une question sur un article, une commande ou une livraison ? Notre équipe répond sur WhatsApp en moins de 2h, 7 jours sur 7.
          </p>

          <button
            onClick={() => ouvrirWA("Bonjour Santa'Style ! 👋\nJe souhaite vous contacter.")}
            style={{ padding: "14px 32px", borderRadius: "12px", background: "#25D366", border: "none", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 20px rgba(37,211,102,0.3)", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <WAIcon size={18} /> Ouvrir WhatsApp
          </button>
        </div>
      </div>

      {/* ── Contenu — fond blanc continu ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "52px 24px 72px" }}>

        {/* ── Infos de contact — cards blanches comme NosMissions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "64px" }}>
          {infos.map((info, i) => (
            <div key={i} style={{ padding: "28px", borderRadius: "18px", background: "#fff", border: `1px solid ${SS.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = SS.gold; e.currentTarget.style.boxShadow = `0 8px 24px rgba(201,168,76,0.12)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = SS.border; e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.05)"; }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: `${SS.gold}15`, border: `1px solid ${SS.gold}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {info.icon}
              </div>
              <div>
                <div style={{ fontSize: "11px", color: SS.textDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{info.titre}</div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: SS.text, marginBottom: "3px" }}>{info.valeur}</div>
                <div style={{ fontSize: "13px", color: SS.textMuted }}>{info.sous}</div>
              </div>
              {info.action && (
                <button onClick={info.action}
                  style={{ marginTop: "4px", padding: "9px 16px", borderRadius: "10px", background: "#25D366", border: "none", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", width: "fit-content", transition: "opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <WAIcon size={14} /> {info.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Formulaire + carte WA ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "72px", alignItems: "start" }}>

          {/* Formulaire */}
          <div>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "11px", color: SS.goldLight, fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>Envoyer un message</div>
              <h2 style={{ fontSize: "26px", fontWeight: "900", color: SS.text, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Comment pouvons-nous<br />vous aider ?</h2>
              <p style={{ fontSize: "14px", color: SS.textMuted, lineHeight: 1.6, margin: 0 }}>
                Sélectionnez le sujet et nous vous répondrons directement sur WhatsApp.
              </p>
            </div>

            {/* Prénom */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                Votre prénom (optionnel)
              </label>
              <input type="text" placeholder="Ex : Mamadou, Fatoumata..."
                value={nom} onChange={e => setNom(e.target.value)}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", background: "#fff", border: `1px solid ${SS.border}`, color: SS.text, fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = SS.gold}
                onBlur={e => e.target.style.borderColor = SS.border} />
            </div>

            {/* Sujets */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "8px" }}>
                Sujet de votre message *
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {SUJETS.map((s, i) => (
                  <button key={i} type="button" onClick={() => setSujetChoisi(i)}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${sujetChoisi === i ? SS.gold : SS.border}`, background: sujetChoisi === i ? `${SS.gold}10` : "#fff", cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{s.emoji}</span>
                    <span style={{ fontSize: "13px", fontWeight: sujetChoisi === i ? "700" : "500", color: sujetChoisi === i ? SS.goldDark : SS.text, flex: 1 }}>{s.label}</span>
                    {sujetChoisi === i && <CheckCircle size={15} color={SS.gold} style={{ flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Détails */}
            {sujetChoisi !== null && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: SS.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                  Détails supplémentaires (optionnel)
                </label>
                <textarea placeholder="Précisez votre demande, l'article concerné, votre taille..."
                  value={messagePersonnalise} onChange={e => setMessagePersonnalise(e.target.value)}
                  rows={3}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", background: "#fff", border: `1px solid ${SS.border}`, color: SS.text, fontSize: "14px", outline: "none", resize: "none", boxSizing: "border-box", transition: "border-color 0.2s", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = SS.gold}
                  onBlur={e => e.target.style.borderColor = SS.border} />
              </div>
            )}

            {/* Bouton envoyer */}
            {/* ✅ actif dès qu'un sujet est sélectionné (0 inclus) */}
            <button onClick={handleEnvoyer} disabled={sujetChoisi === null}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", background: sujetChoisi !== null ? "#25D366" : "#C8C8C8", border: "none", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: sujetChoisi !== null ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "all 0.2s", opacity: 1, boxShadow: sujetChoisi !== null ? "0 4px 16px rgba(37,211,102,0.3)" : "none" }}
              onMouseEnter={e => { if (sujetChoisi !== null) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
              {envoye
                ? <><CheckCircle size={18} /> Message ouvert dans WhatsApp !</>
                : <><WAIcon size={18} /> Envoyer via WhatsApp</>}
            </button>
            {sujetChoisi === null && (
              <p style={{ fontSize: "12px", color: SS.textDim, textAlign: "center", marginTop: "8px" }}>
                Sélectionnez un sujet pour activer l'envoi
              </p>
            )}
          </div>

          {/* Colonne droite */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ✅ Card WA — charte or au lieu du vert foncé */}
            <div style={{ padding: "28px", borderRadius: "20px", background: SS.surface, border: `1px solid ${SS.border}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${SS.gold}10 1px, transparent 1px)`, backgroundSize: "20px 20px", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `linear-gradient(135deg, ${SS.goldLight}, ${SS.gold})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(201,168,76,0.3)" }}>
                    <WAIcon size={22} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: SS.text }}>Santa'Style</div>
                    <div style={{ fontSize: "12px", color: SS.textMuted, display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#25D366", display: "inline-block" }} />
                      En ligne · Répond rapidement
                    </div>
                  </div>
                </div>

                {/* Bulle simulée — fond blanc */}
                <div style={{ background: "#fff", borderRadius: "12px 12px 12px 0", padding: "14px 16px", marginBottom: "20px", border: `1px solid ${SS.border}` }}>
                  <p style={{ fontSize: "14px", margin: 0, lineHeight: 1.6, color: SS.text }}>
                    Bonjour ! 👋 Bienvenue chez Santa'Style. Comment puis-je vous aider aujourd'hui ?
                  </p>
                  <div style={{ fontSize: "11px", color: SS.textDim, marginTop: "6px", textAlign: "right" }}>Santa'Style · maintenant</div>
                </div>

                <div style={{ fontSize: "13px", color: SS.textMuted, marginBottom: "16px", fontWeight: "600" }}>
                  +224 620 762 508
                </div>

                <button onClick={() => ouvrirWA("Bonjour Santa'Style ! 👋")}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "#25D366", border: "none", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 16px rgba(37,211,102,0.3)", transition: "opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <WAIcon size={16} /> Démarrer la conversation
                </button>
              </div>
            </div>

            {/* Horaires — card blanche */}
            <div style={{ padding: "24px", borderRadius: "16px", background: "#fff", border: `1px solid ${SS.border}`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: SS.text, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${SS.gold}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={15} color={SS.gold} />
                </div>
                Horaires de disponibilité
              </div>
              {[
                { jour: "Lundi — Vendredi", heure: "8h — 22h" },
                { jour: "Samedi",           heure: "9h — 22h" },
                { jour: "Dimanche",         heure: "10h — 20h" },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${SS.border}` : "none" }}>
                  <span style={{ fontSize: "13px", color: SS.text, fontWeight: "500" }}>{h.jour}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: SS.textMuted }}>{h.heure}</span>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#25D366", flexShrink: 0 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "14px", padding: "10px 12px", borderRadius: "8px", background: SS.successBg, border: `1px solid ${SS.success}30`, fontSize: "12px", color: SS.success, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={13} /> Réponse garantie en moins de 2h
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ marginBottom: "72px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "11px", color: SS.goldLight, fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>Questions fréquentes</div>
            <h2 style={{ fontSize: "30px", fontWeight: "900", color: SS.text, margin: 0, letterSpacing: "-0.02em" }}>FAQ</h2>
          </div>

          <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {faq.map((item, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${faqOuverte === i ? SS.gold : SS.border}`, borderRadius: "12px", overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => setFaqOuverte(faqOuverte === i ? null : i)}
                  style={{ width: "100%", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "12px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600", color: SS.text, flex: 1 }}>{item.q}</span>
                  <span style={{ fontSize: "20px", color: SS.gold, fontWeight: "300", flexShrink: 0, transform: faqOuverte === i ? "rotate(45deg)" : "none", transition: "transform 0.2s", lineHeight: 1 }}>+</span>
                </button>
                {faqOuverte === i && (
                  <div style={{ padding: "0 20px 18px" }}>
                    <div style={{ height: "1px", background: SS.border, marginBottom: "14px" }} />
                    <p style={{ fontSize: "14px", color: SS.textMuted, lineHeight: 1.7, margin: 0 }}>{item.r}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA final — même style que NosMissions ── */}
        <div style={{ padding: "40px 36px", borderRadius: "20px", background: SS.surface, border: `1px solid ${SS.border}`, textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: SS.goldLight, fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>On est là maintenant</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: SS.goldDark, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
            Encore des questions ?
          </h2>
          <p style={{ fontSize: "14px", color: SS.textMuted, margin: "0 0 24px" }}>
            Notre équipe est disponible 7j/7 — réponse en moins de 2h sur WhatsApp.
          </p>
          <button onClick={() => ouvrirWA("Bonjour Santa'Style ! 👋\nJ'ai une question.")}
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 32px", borderRadius: "12px", border: "none", background: "#25D366", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,211,102,0.3)", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            <WAIcon size={18} /> Nous écrire sur WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}