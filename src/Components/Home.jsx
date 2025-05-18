import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/heroImage.png';
import Navbar from './Navbar.jsx';
import './Home.css'; 

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container hero-container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center mb-4 mb-md-0">
            <img
              src={heroImage}
              alt="Developer illustration"
              className="img-fluid hero-image"
            />
          </div>
          <div className="col-md-6">
            <h1 className="display-5 hero-heading">Personalized Learning Platform</h1>
            <p className="hero-description">
              Discover courses, videos, and learning paths tailored just for you.
              Powered by your interests and advanced recommendations.
            </p>
            <button
              className="btn btn-primary btn-lg hero-button"
              onClick={() => navigate('/signin')}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
