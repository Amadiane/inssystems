import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";

const Loginbtn = () => {

  const navigate = useNavigate();
  
  const handleLogout = async () => {
    console.log('Déconnexion réussie !');
    localStorage.removeItem('access');
    localStorage.removeItem('user');
    navigate('/');
  
  };


  return (

        <button onClick={handleLogout} className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">Logout
      <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" className="w-4 h-4 ml-1" viewBox="0 0 24 24">
        <path d="M5 12h14M12 5l7 7-7 7"></path>
      </svg>
    </button>

  )
}

export default Loginbtn