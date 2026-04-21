import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg"; // Importation de l'image du logo

const Logo = () => {
  return (
    <Link to="/home" className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
      <img src={logo} alt="logo" className="w-18 h-20 mr-3" /> {/* Image du logo agrandie */}
    </Link>
  );
};

export default Logo;
