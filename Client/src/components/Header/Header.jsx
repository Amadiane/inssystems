import { useEffect, useState } from "react";
import Navlinks from "./Navlinks";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-[100]
        transition-all duration-300
        ${isScrolled
          ? "bg-[#0a0e27]/95 backdrop-blur-xl shadow-lg"
          : "bg-[#0a0e27]/70 backdrop-blur-md"}
      `}
    >
      <Navlinks />
    </header>
  );
};

export default Header;
