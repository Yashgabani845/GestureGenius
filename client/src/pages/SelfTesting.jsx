"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "./css/SelfTesting.css"

const ASLDetector = () => {
  const [prediction, setPrediction] = useState("")

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:5001/prediction")
        const data = await response.json()
        setPrediction(data.class)
      } catch (error) {
        console.error("Error fetching prediction:", error)
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="asl-detector">
      {/* Navbar */}
      <nav className="asl-navbar">
        <div className="asl-container">
          <Link to="/" className="asl-logo">GestureGenius</Link>
          <ul className="asl-nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/self-testing">Self Testing</Link></li>
            <li><Link to="/video-calling">Video Calling</Link></li>
            <li><Link to="/learn">Learn ASL</Link></li>
            <li><Link to="/explore">Explore Model</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="asl-content">
        <h1 className="title">Real-Time ASL Detection</h1>
        <div className="video-wrapper">
          <img src="http://localhost:5001/video_feed" alt="Live ASL Stream" className="video-feed" />
        </div>
        <div className="output-box">
          <h2>Detected Sign</h2>
          <div className={`detected-sign ${prediction ? "" : "no-hand"}`}>
            {prediction || "Waiting for sign..."}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ASLDetector
