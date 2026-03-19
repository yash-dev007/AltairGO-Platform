import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Mail, Lock, User, ArrowRight, Globe, Shield, Sparkles, AlertCircle } from 'lucide-react';
import styles from './Auth.module.css';
import logo from '../../assets/logo.png';

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444', pct: '20%' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b', pct: '45%' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6', pct: '70%' };
  return { score, label: 'Strong', color: '#10b981', pct: '100%' };
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 12) { setError('Password must be at least 12 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/trips');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.heroPanel}>
        <div className={styles.heroOverlay}>
          <Link to="/" className={styles.heroBrand}>
            <img src={logo} alt="AltairGO Logo" className={styles.heroLogo} />
          </Link>
          <h2 className={styles.heroTitle}>
            Join thousands of<br />smart travelers.
          </h2>
          <p className={styles.heroSubtitle}>
            Create your free account and start generating AI-powered travel itineraries in minutes.
            No credit card required.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <strong>Free</strong>
              <span>Forever</span>
            </div>
            <div className={styles.heroStat}>
              <strong>Instant</strong>
              <span>Setup</span>
            </div>
            <div className={styles.heroStat}>
              <strong>AI</strong>
              <span>Powered</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.formIcon}><Sparkles size={26} /></div>
            <h1 className={styles.formTitle}>Create account</h1>
            <p className={styles.formSubtitle}>Start planning your dream trips today</p>
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
                autoComplete="name"
              />
            </div>

            <div className={styles.inputGroup}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Password (min. 12 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="new-password"
              />
              {password && (
                <div className={styles.strengthBar}>
                  <div className={styles.strengthFill} style={{ width: strength.pct, background: strength.color }} />
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'} {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" className={styles.footerLink}>Sign in</Link>
          </div>

          <div className={styles.trustRow}>
            <div className={styles.trustItem}><Shield size={14} /> Secure</div>
            <div className={styles.trustItem}><Sparkles size={14} /> AI-Powered</div>
            <div className={styles.trustItem}><Globe size={14} /> Free</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
