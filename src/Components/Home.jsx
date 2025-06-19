import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/heroImage1.png';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <header className="navbar">
        <div className="logo">LearnX</div>
        <nav>
          <ul className="nav-links">
            <li onClick={() => navigate('/login')} className="nav-button">Login</li>
            <li onClick={() => navigate('/signin')} className="nav-button">Sign In</li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1 className="main-heading">
            Personalized <br /> Learning Platform
          </h1>
          <p className="subheading">
            Learn your way, at your pace — tailored courses & videos, intelligently recommended.
          </p>
          <button className="hero-button" onClick={() => navigate('/signin')}>
            Get Started
          </button>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Developer" />
        </div>
      </section>

      <footer className="footer-icons">
        <div className="socials">
          <i className="fab fa-facebook-f" />
          <i className="fab fa-instagram" />
          <i className="fab fa-twitter" />
        </div>
      </footer>
    </div>
  );
}

export default Home;
