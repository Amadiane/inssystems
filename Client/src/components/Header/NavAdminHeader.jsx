import React, { useEffect, useState } from "react";
import Logo from "./admin/Logo";
import Navlinks from "./admin/Navlinks";
import Loginbtn from "./admin/Loginbtn";

/**
 * 🎨 NavAdminHeader - Sidebar Admin avec thème dark
 * 
 * Features:
 * - Fond dark avec gradient
 * - Barre de progression violet/or
 * - Effets de profondeur (blobs)
 * - Border violet subtile
 */

const NavAdminHeader = () => {
  return (
    <header className="bg-gradient-to-b from-dark-100 to-dark-200 body-font fixed top-0 left-0 w-[250px] h-full z-50 shadow-glow border-r border-brand-purple/20">
      {/* Sidebar with content aligned to the left */}
      <div className="flex flex-col p-5 items-start h-full justify-between relative">
        
        {/* Decorative gradient blobs for depth */}
        <div className="absolute top-20 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-40 left-0 w-24 h-24 bg-brand-purple-dark/10 rounded-full blur-2xl opacity-40"></div>

        {/* Upper part of the sidebar */}
        <div className="mb-8 relative z-10">
          <Logo color="#a34ee5" />
        </div>

        {/* Navigation links */}
        <div className="mb-9 flex-1 relative z-10 w-full overflow-y-auto">
          <Navlinks /> {/* Admin navigation links */}
        </div>
        
        {/* Bottom section - Login button */}
        <div className="mt-auto relative z-10 w-full">
          {/* <LanguageSwitcher /> */}
          <Loginbtn />
        </div>
      </div>

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-brand-purple/10"></div>
    </header>
  );
};

export default NavAdminHeader;