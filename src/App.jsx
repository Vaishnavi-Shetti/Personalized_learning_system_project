import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Questionnaire from './Components/Questionnaire';
import Recommendation from './Components/Recommendation';
import Registration from './Components/Registration';
import SignIn from './Components/SignIn';
import Home from './Components/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Signin" element={<SignIn />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/recommendation" element={<Recommendation />} />
    </Routes>
  );
}

export default App;
