import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          Personalized Learning Platform
        </Link>
        <div className="d-flex">
          <Link to="/signin" className="btn btn-light">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
// "UCeVMnSShP_Iviwkknt83cww", // CodeWithHarry
//   "UCWv7vMbMWH4-V0ZXdmDpPBA", // ProgrammingWithMosh
//   "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
//   "UCxX9wt5FWQUAAz4UrysqK9A", // JennysLectures
//   "UCVYamHliCI9rw1tHR1xbkfw", // ApnaCollege
//   "UCQYMhOMi_Cdj1CEAU-fv80A", // NesoAcademy
//   "UC4SVo0Ue36XCfOyb5Lh1viQ", // BroCode
//   "UCzuaYxY3ULt0CGu41Z4UNPQ", // Babbar
//   "UCYO_jab_esuFRV4b17AJtAw", // 3Blue1Brown
//   "UCvjgXvBlbQiydffZU7m1_aw", // Fireship
//   "UCsBjURrPoezykLs9EqgamOA", // The Net Ninja
//   "UC29ju8bIPH5as8OGnQzwJyA", // Traversy Media
//   "UCBwmMxybNva6P_5VmxjzwqA", // Academind
//   "UC4xKdmAXFh4ACyhpiQ_3qBw", // Codevolution

