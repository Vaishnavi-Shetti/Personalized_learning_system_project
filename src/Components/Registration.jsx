// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { createUserWithEmailAndPassword } from "firebase/auth";
// // import { auth, db } from "../firebase"; // Import db
// // import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

// // const Registration = () => {
// //   const navigate = useNavigate();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //   });

// //   const handleChange = (e) => {
// //     setFormData({ ...formData, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const userCredential = await createUserWithEmailAndPassword(
// //         auth,
// //         formData.email,
// //         formData.password
// //       );

// //       const user = userCredential.user;

// //       //  Save name and email to Firestore under userData collection
// //       await setDoc(doc(db, 'userData', user.uid), {
// //         name: formData.name,
// //         email: formData.email,
// //         registrationTimestamp: new Date(), // optional: store registration time
// //       });

// //       console.log("User Registered & Info Saved:", user.uid);
// //       navigate("/questionnaire");

// //     } catch (error) {
// //       console.error("Registration Error:", error.message);
// //       alert(error.message);
// //     }
// //   };

// //   return (
// //     <div className="container d-flex justify-content-center align-items-center vh-100">
// //       <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
// //         <h2 className="text-center mb-4">Register</h2>
// //         <form onSubmit={handleSubmit}>
// //           <div className="form-group mb-3">
// //             <label className="form-label">Full Name</label>
// //             <input
// //               type="text"
// //               name="name"
// //               className="form-control"
// //               placeholder="Enter your full name"
// //               value={formData.name}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>

// //           <div className="form-group mb-3">
// //             <label className="form-label">Email address</label>
// //             <input
// //               type="email"
// //               name="email"
// //               className="form-control"
// //               placeholder="Enter your email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>

// //           <div className="form-group mb-4">
// //             <label className="form-label">Password</label>
// //             <input
// //               type="password"
// //               name="password"
// //               className="form-control"
// //               placeholder="Create a password"
// //               value={formData.password}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>

// //           <button type="submit" className="btn btn-success w-100 mb-2">
// //             Register
// //           </button>

// //           <div className="text-center">
// //             <small>
// //               Already have an account? <a href="/signin">Sign In</a>
// //             </small>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Registration;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { auth, db } from '../firebase';
// import { doc, setDoc } from 'firebase/firestore';
// import './Registration.css';

// function SignIn() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       await setDoc(doc(db, 'users', user.uid), {
//         email: user.email,
//         uid: user.uid,
//       });
//       navigate('/questionnaire');
//     } catch (error) {
//       alert(error.message);
//     }
//   };

//   return (
//     <div className="form-container">
//       <div className="form-card">
//         <div className="form-left">
//           <h2>Create Your Account</h2>
//           <form onSubmit={handleSignUp}>
//             <label>Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="form-control"
//             />

//             <label>Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="form-control"
//             />

//             <button type="submit">Sign Up</button>
//           </form>
//         </div>

//         <div className="form-right">
//           <h1>Welcome to MindPath</h1>
//           <p>Join us and start your personalized learning journey today. Explore skills that matter to your future.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SignIn;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import './Registration.css';

const Registration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, 'userData', user.uid), {
        name: formData.name,
        email: formData.email,
        registrationTimestamp: new Date(),
      });

      console.log("User Registered & Info Saved:", user.uid);
      navigate("/questionnaire");

    } catch (error) {
      console.error("Registration Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-left">
          <h2>Create Your Account</h2>
          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit">Register</button>

            <p className="signin-link">
              Already have an account? <a href="/signin">Sign In</a>
            </p>
          </form>
        </div>

        <div className="registration-right">
          <h1>Welcome to LearnX</h1>
          <p>Your learning journey begins here. Customize your experience and start mastering what matters most.</p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
