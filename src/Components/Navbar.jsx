import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Personalized Learning Platform
        </Link>

        <div className="d-flex align-items-center gap-2">
          <Link to="/profile" className="btn btn-outline-light">
            Profile
          </Link>
          <Link to="/signin" className="btn btn-light">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
