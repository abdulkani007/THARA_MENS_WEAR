import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import logo from '../assets/thara-logo.jpeg';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const role = email === 'thara@gmail.com' ? 'admin' : 'user';
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        role: role,
        createdAt: new Date()
      });

      toast.success('Registration successful!');
      
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
      background: '#000000'
    }}>
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
        }}>Create your account</p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              minLength="6"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#C5C6C7' }}>
          Already have an account? <Link to="/login" style={{ color: '#FF2E2E', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
