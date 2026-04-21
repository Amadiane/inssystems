import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Footerlinks = ({ links, header }) => {

  useEffect(() => {
    // Fonction pour défiler la page vers le haut
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Ajouter l'écouteur d'événements pour les clics sur les liens
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
      link.addEventListener('click', scrollToTop);
    });

    // Nettoyer l'écouteur d'événements lorsque le composant est démonté
    return () => {
      footerLinks.forEach(link => {
        link.removeEventListener('click', scrollToTop);
      });
    };
  }, []);

  return (
    <div className="lg:w-1/4 md:w-1/2 w-full px-4">
      <h2 className="title-font font-medium text-white tracking-widest text-sm mb-3 uppercase">{header}</h2>
      {/* Ajout de space-y-3 pour espacer les éléments */}
      <nav className="list-none mb-0 space-y-3">
        {links && links.map((link) => {
          if (link === "Qui sommes-nous ?") {
            return (
              <li key={link}>
                <NavLink
                  to="/qui-sommes-nous-"  // Redirige directement vers la page Quisommesnous
                  className={({ isActive }) => `footer-link hover:text-white ${isActive ? "text-orange-500" : "text-white"}`}
                >
                  {link}
                </NavLink>
              </li>
            );
          }

          // if (link === "Contacter Tamkine") {
            if (link === "Contacter Jorfof") {
            return (
              <li key={link}>
                <NavLink
                  to="/contacter-tamkine"  // Redirige directement vers la page Contacter Tamkine
                  className={({ isActive }) => `footer-link hover:text-white ${isActive ? "text-orange-500" : "text-white"}`}
                >
                  {link}
                </NavLink>
              </li>
            );
          }

          if (link === "Nous rejoindre") {
            return (
              <li key={link}>
                <NavLink
                  to="/nous-rejoindre"  // Redirige directement vers la page Contacter Tamkine
                  className={({ isActive }) => `footer-link hover:text-white ${isActive ? "text-orange-500" : "text-white"}`}
                >
                  {link}
                </NavLink>
              </li>
            );
          }

          // Autres liens
          return (
            <li key={link}>
              <NavLink
                to={`/${link === "home" ? "" : link}`} // Gère le lien pour "home" sans préfixe
                className={({ isActive }) => `footer-link hover:text-white ${isActive ? "text-orange-500" : "text-white"}`}
              >
                {link}
              </NavLink>
            </li>
          );
        })}
      </nav>
    </div>
  );
};

export default Footerlinks;
