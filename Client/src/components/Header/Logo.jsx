import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

/**
 * 🎨 LOGO COMPONENT - TEKACOM
 * Taille optimale pour header moderne (capture 2)
 */

const Logo = ({ scrolled }) => {
  return (
    <Link
      to="/"
      className="relative flex items-center group ml-4 md:ml-6"
    >
      {/* LOGO CONTAINER */}
      <div
        className={`
          relative overflow-hidden flex items-center justify-center
          transition-all duration-500 ease-in-out
          ${
            scrolled
              ? "w-32 h-10 md:w-36 md:h-12"
              : "w-36 h-12 md:w-40 md:h-14"
          }
        `}
      >
        <img
          src={logo}
          alt="Tekacom logo"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Effet de glow au hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#a34ee5] to-[#fec603] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      </div>
    </Link>
  );
};

export default Logo;