import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({ text, className }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
        console.log('Déconnexion réussie !');
        localStorage.removeItem('access');
        localStorage.removeItem('user');
        window.location.reload();
};

  return (
    <button onClick={handleLogout} className={`${className}`}>
      {text}
    </button>
  );
};

export default LogoutButton;
