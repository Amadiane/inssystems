import React from 'react';
import logo from '../../assets/logoblanc.png';

const Loader = () => {
  return (
    // <div style={styles.loaderContainer}>
    //   <img src={logo} alt="Logo de la Fondation Tamkine" style={styles.loaderImage} />
    // </div>
    <div style={styles.loaderContainer}>
      <img src={logo} alt="Logo de Jorfof" style={styles.loaderImage} />
    </div>
  );
};

const styles = {
  loaderContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000', // fond noir
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderImage: {
    width: '200px',
    height: 'auto',
  },
};

export default Loader;
