import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { FiMail, FiLock, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Login.css';

const ADMIN_EMAILS = ['thara@gmail.com', 'admin@thara.com'];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      let role = 'user';
      
      if (userDoc.exists()) {
        role = userDoc.data().role;
      } else {
        // Auto-assign admin role for admin emails
        role = ADMIN_EMAILS.includes(user.email.toLowerCase()) ? 'admin' : 'user';
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          role: role,
          createdAt: new Date()
        });
      }
      
      toast.success(`Welcome ${role === 'admin' ? 'Admin' : 'back'}!`);
      
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/user', { replace: true });
      }, 100);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button onClick={() => navigate('/')} className="home-btn">
        <FiHome /> Home
      </button>

      <div className="login-container">
        <div className="login-card">
          <h1>THARA</h1>
          <p className="subtitle">Men's Wear</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary full-width">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>

          <div className="admin-info">
            <p>Admin Access:</p>
            <p>thara@gmail.com</p>
            <p>admin@thara.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
