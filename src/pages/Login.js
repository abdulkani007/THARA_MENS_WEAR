import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FiHome } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import logo from '../assets/thara-logo.jpeg';

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
        // Create user document if it doesn't exist
        role = user.email === 'thara@gmail.com' ? 'admin' : 'user';
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: role,
          createdAt: new Date()
        });
      }
      
      toast.success('Login successful!');
      
      // Use setTimeout to ensure navigation happens after state updates
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/user', { replace: true });
      }, 100);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      let role = 'user';
      
      if (!userDoc.exists()) {
        role = result.user.email === 'thara@gmail.com' ? 'admin' : 'user';
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          role: role,
          createdAt: new Date()
        });
      } else {
        role = userDoc.data().role;
      }
      
      toast.success('Login successful!');
      
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/user', { replace: true });
      }, 100);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      background: '#000000'
    }}>
      {/* Home Button */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          background: '#000000',
          border: '1px solid #1F2833',
          borderRadius: '8px',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1F2833';
          e.currentTarget.style.borderColor = '#FF2E2E';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#111111';
          e.currentTarget.style.borderColor = '#1F2833';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <FiHome size={18} />
        <span>Home</span>
      </Link>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px',
        background: '#000000',
        border: '1px solid #1F2833',
        borderRadius: '12px',
        boxShadow: '0 0 25px rgba(0, 0, 0, 0.4)'
      }}>
        <img src={logo} alt="THARA Men's Wear" style={{ height: '50px', width: 'auto', marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
        <p style={{
          textAlign: 'center',
          color: '#C5C6C7',
          marginBottom: '32px',
          fontSize: '16px'
        }}>Welcome back</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#C5C6C7' }}>Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#C5C6C7' }}>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div style={{ margin: '24px 0', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>OR</div>

        <button onClick={handleGoogleLogin} disabled={loading} style={{ 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: '#FFFFFF',
          color: '#000000',
          padding: '12px 32px',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          letterSpacing: '0.5px'
        }}>
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#C5C6C7' }}>
          Don't have an account? <Link to="/register" style={{ color: '#FF2E2E', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
