import { BrainCircuit, Image, Globe, BarChart, Users, Zap } from "lucide-react"
import { Link } from "react-router-dom"

const ExplorePage = () => {
  return (
    <div className="explore-page">
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
            

      <header className="hero">
        <div className="container">
          <h1>Explore Our <span>AI Model</span></h1>
          <p>Discover the power of our advanced ASL detection technology</p>
        </div>
      </header>

     

      <section className="technical-details">
        <div className="container">
          <h2>Technical Highlights</h2>
          <div className="tech-grid">
            <div className="tech-card">
              <BrainCircuit className="icon" />
              <h3>MobileNet Architecture</h3>
              <p>
                Built on the efficient MobileNet architecture, optimized for mobile and edge devices without
                compromising on performance.
              </p>
            </div>
            <div className="tech-card">
              <Image className="icon" />
              <h3>Extensive Dataset</h3>
              <p>
                Fine-tuned on a curated dataset of 30,000+ ASL gesture images, ensuring robust recognition across
                diverse hand shapes and positions.
              </p>
            </div>
            <div className="tech-card">
              <Globe className="icon" />
              <h3>Real-time Processing</h3>
              <p>
                Achieves real-time detection and recognition, providing instant feedback for seamless communication
                experiences.
              </p>
            </div>
            <div className="tech-card">
              <BarChart className="icon" />
              <h3>99% Accuracy</h3>
              <p>
                Our model boasts an impressive 99% accuracy rate, ensuring reliable and precise ASL gesture recognition.
              </p>
            </div>
            <div className="tech-card">
              <Users className="icon" />
              <h3>Multi-user Support</h3>
              <p>
                Capable of detecting and recognizing ASL gestures from multiple users simultaneously in various
                environments.
              </p>
            </div>
            <div className="tech-card">
              <Zap className="icon" />
              <h3>Low Latency</h3>
              <p>
                Optimized for minimal latency, ensuring smooth and responsive user interactions in real-time
                applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .explore-page {
          font-family: 'Inter', sans-serif;
          color: #333;
          line-height: 1.6;
        }

        .navbar {
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1rem 0;
        }

        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: #1a365d;
          text-decoration: none;
        }

        .logo span {
          color: #2b6cb0;
        }

        .navbar ul {
          display: flex;
          gap: 1.5rem;
          list-style: none;
        }

        .navbar ul li a {
          color:rgb(61, 75, 97);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .navbar a:hover, .navbar a.active {
          color: #2b6cb0;
          text-decoration: underline;
        }

        .hero {
          background-color: #2b6cb0;
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .hero h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .hero h1 span {
          color: #ffcc00;
        }

        .hero p {
          font-size: 1.3rem;
          max-width: 600px;
          margin: 0 auto;
        }

        section {
          padding: 4rem 0;
        }

        h2 {
          font-size: 2.2rem;
          color: #2d3748;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .tech-card {
          background: white;
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tech-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}

export default ExplorePage
