import React from 'react';
import { Link } from "react-router-dom"
import { Camera, Video, BrainCircuit, Users, BookOpen, Heart, Github, Twitter, Linkedin } from 'lucide-react'
import "./home.css"
import team from "./team.jpg"
import hero from "./hero.jpg"
const HomePage = () => {
  return (
    <div className="homepage">
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

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Breaking Barriers Through Sign Language 🌟</h1>
            <p>Empowering communication with real-time ASL detection and translation</p>
            <div className="hero-buttons">
              <Link to="/self-testing" className="primary-button">
                Get Started 👋
              </Link>
              <Link to="/learn" className="secondary-button">
                Learn More 📚
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img src={hero} alt="ASL Detection Illustration" className='heroimg' />
          </div>
        </div>
        <div className="wave-shape"></div>
      </section>

     

      <section className="problem-section">
        <div className="container">
          <div className="section-header-new">
            <h2>Breaking Down Communication Barriers 🌉</h2>
            <div className="header-line"></div>
          </div>
          <div className="barrier-cards">
            <div className="barrier-card">
              <div className="barrier-icon">🏢</div>
              <h3>Professional Workplace</h3>
              <p>Overcoming communication gaps in professional environments</p>
            </div>
            <div className="barrier-card">
              <div className="barrier-icon">🎓</div>
              <h3>Educational Settings</h3>
              <p>Making learning accessible for all students</p>
            </div>
            <div className="barrier-card">
              <div className="barrier-icon">🏥</div>
              <h3>Healthcare Access</h3>
              <p>Ensuring clear communication in medical situations</p>
            </div>
            <div className="barrier-card">
              <div className="barrier-icon">🤝</div>
              <h3>Social Interaction</h3>
              <p>Breaking barriers in everyday social situations</p>
            </div>
          </div>
        </div>
        <div className="shape-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section">
        <div className="container">
          <div className="section-header-new">
            <h2>How ASL Communicator Helps 🚀</h2>
            <div className="header-line"></div>
          </div>
          <div className="solution-grid">
            <div className="solution-card">
              <BrainCircuit className="icon" />
              <h3>AI-Powered Detection</h3>
              <p>Real-time sign language recognition with deep learning technology</p>
            </div>
            <div className="solution-card">
              <Camera className="icon" />
              <h3>Self Testing</h3>
              <p>Practice ASL with instant feedback and performance tracking</p>
            </div>
            <div className="solution-card">
              <Video className="icon" />
              <h3>Smart Video Calls</h3>
              <p>Enhanced video communication with ASL recognition support</p>
            </div>
          </div>
        </div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="container">
          <div className="section-header-new">
            <h2>Our Mission & Vision 🎯</h2>
            <div className="header-line"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <p>
                At ASL Detector, we're passionate about making communication accessible to everyone. Our team of
                developers, researchers, and accessibility advocates work together to create innovative solutions for
                the deaf and hard-of-hearing community.
              </p>
              <div className="about-values">
                <div className="value-item">
                  <Users className="value-icon" />
                  <h4>Inclusive Design</h4>
                </div>
                <div className="value-item">
                  <BookOpen className="value-icon" />
                  <h4>Continuous Learning</h4>
                </div>
                <div className="value-item">
                  <Heart className="value-icon" />
                  <h4>Community First</h4>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img src={team} alt="Our Team" className='team' />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Users Say 💬</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "ASL Detector has transformed how I communicate at work. It's incredibly accurate and easy to use."
                </p>
                <div className="testimonial-author">
                  <div>
                    <h4>Sarah M.</h4>
                    <p>ASL User</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"As an educator, this tool has made my classroom more inclusive and accessible for all students."</p>
                <div className="testimonial-author">
                  <div>
                    <h4>John D.</h4>
                    <p>Teacher</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Break Communication Barriers? 🚀</h2>
          <p className='footerfont'>Join thousands of users who are already making a difference</p>
          <div className="cta-buttons">
            <Link to="/self-testing" className="primary-button">
              Try It Now
            </Link>
            <Link to="/contact" className="secondary-button">
              Contact Us
            </Link>
          </div>
        </div>
        <div className="circle-shape"></div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🤟 GestureGenius</h3>
              <p>Breaking communication barriers with technology</p>
              <div className="social-links">
                <a href="#" aria-label="Github">
                  <Github />
                </a>
                <a href="#" aria-label="Twitter">
                  <Twitter />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <Linkedin />
                </a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <Link to="/about">About Us</Link>
                </li>
                <li>
                  <Link to="/features">Features</Link>
                </li>
                <li>
                  <Link to="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <Link to="/blog">Blog</Link>
                </li>
                <li>
                  <Link to="/tutorials">Tutorials</Link>
                </li>
                <li>
                  <Link to="/documentation">Documentation</Link>
                </li>
                <li>
                  <Link to="/support">Support</Link>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact Us</h4>
              <ul>
                <li>📞 +91 7046996816</li>
                <li>📍 402 Aster Nadiad</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} ASL Detector. All rights reserved.</p>
            
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
