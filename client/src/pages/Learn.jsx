import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const signs = [
  { id: 1, name: "A", image: "/sign/A.webp" },
  { id: 2, name: "B", image: "/sign/B.webp" },
  { id: 3, name: "C", image: "/sign/C.webp" },
  { id: 4, name: "D", image: "/sign/D.webp" },
  { id: 5, name: "E", image: "/sign/E.webp" },
  { id: 6, name: "F", image: "/sign/F.webp" },
  { id: 7, name: "G", image: "/sign/G.webp" },
  { id: 8, name: "H", image: "/sign/H.webp" },
  { id: 9, name: "I", image: "/sign/I.webp" },
  { id: 10, name: "J", image: "/sign/J.webp" },
  { id: 11, name: "K", image: "/sign/K.webp" },
  { id: 12, name: "L", image: "/sign/L.webp" },
  { id: 13, name: "M", image: "/sign/M.webp" },
  { id: 14, name: "N", image: "/sign/N.webp" },
  { id: 15, name: "O", image: "/sign/O.webp" },
  { id: 16, name: "P", image: "/sign/P.webp" },
  { id: 17, name: "Q", image: "/sign/Q.webp" },
  { id: 18, name: "R", image: "/sign/R.webp" },
  { id: 19, name: "S", image: "/sign/S.webp" },
  { id: 20, name: "T", image: "/sign/T.webp" },
  { id: 21, name: "U", image: "/sign/U.webp" },
  { id: 22, name: "V", image: "/sign/V.webp" },
  { id: 23, name: "W", image: "/sign/W.webp" },
  { id: 24, name: "X", image: "/sign/X.webp" },
  { id: 25, name: "Y", image: "/sign/Y.webp" },
  { id: 26, name: "Z", image: "/sign/Z.webp" },
  { id: 27, name: "Space", image: "/sign/A.webp" },
  { id: 28, name: "Delete", image: "/sign/A.webp" }
];

const Learn = () => {
  const [currentSign, setCurrentSign] = useState(signs[0]);

  return (
    <div style={styles.appContainer}>
       <nav className="asl-navbar">
        <div className="asl-container">
          <Link to="/" className="asl-logo">
           GestureGenius
          </Link>
          <ul className="asl-nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/self-testing">Self Testing</Link></li>
            <li><Link to="/video-calling">Video Calling</Link></li>
            <li><Link to="/learn">Learn ASL</Link></li>
            <li><Link to="/explore">Explore Model</Link></li>
          </ul>
        </div>
      </nav>
      
      <main style={styles.main}>
        <h1 style={styles.title}>Learn ASL Alphabet</h1>

        <div style={styles.contentContainer}>
          <div style={styles.signDisplay}>
            <div style={styles.signCard}>
              <img 
                src={currentSign.image} 
                alt={currentSign.name}
                style={styles.signImage}
              />
              <h2 style={styles.signTitle}>{currentSign.name}</h2>
              <p style={styles.signDescription}>
                Practice this sign and use our detector to check your accuracy!
              </p>
            </div>
          </div>

          <div style={styles.signLibrary}>
            <h3 style={styles.libraryTitle}>Sign Library</h3>
            <div style={styles.signsGrid}>
              {signs.map((sign) => (
                <button
                  key={sign.id}
                  style={{
                    ...styles.signButton,
                    ...(currentSign.id === sign.id ? styles.activeButton : {})
                  }}
                  onClick={() => setCurrentSign(sign)}
                >
                  {sign.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.tryDetector}>
          <Link 
            to="/self-testing" 
            style={styles.detectorButton}
          >
            Try the Detector
          </Link>
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>&copy; 2024 ASL Detector. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  appContainer: {
    minHeight: '50vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem 0',
  },
  nav: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
  main: {
    flexGrow: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
    gap: '2rem',
  },
  signDisplay: {
    width: window.innerWidth >= 768 ? '50%' : '100%',
  },
  signCard: {
    backgroundColor: '#f3f4f6',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },signImage: {
    display: 'block',
    margin: '0 auto 1rem',
    width: '150px',  // Set a fixed width
    height: '150px', // Set a fixed height
    objectFit: 'cover', // Ensures image fills the area without distortion
    borderRadius: '10px' // Optional: adds rounded corners
  },
  
  signTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  signDescription: {
    textAlign: 'center',
    color: '#666',
  },
  signLibrary: {
    width: window.innerWidth >= 768 ? '50%' : '100%',
  },
  libraryTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  signsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.5rem',
  },
  signButton: {
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#f3f4f6',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  activeButton: {
    backgroundColor: '#dbeafe',
    border: '2px solid #2563eb',
  },
  tryDetector: {
    textAlign: 'center',
    marginTop: '3rem',
  },
  detectorButton: {
    display: 'inline-block',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
  },
};

export default Learn;