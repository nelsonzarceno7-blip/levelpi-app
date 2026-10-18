import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Moon, Sun, Triangle, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'signup';

const usernameEmail = (username: string) => `${username.toLowerCase()}@accounts.levelpi.local`;

function App() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  }, [isLight]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim().toLowerCase();
    setError('');
    setMessage('');

    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      setError('Usa entre 3 y 20 caracteres: letras, números o guion bajo.');
      return;
    }

    if (password.length < 6) {
      setError('Tu contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const email = usernameEmail(normalizedUsername);
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      const alreadyExists = result.error.message.toLowerCase().includes('already registered');
      setError(mode === 'signup' && alreadyExists
        ? 'Ese nombre ya está ocupado. Prueba con otro.'
        : mode === 'login'
          ? 'El usuario o la contraseña no son correctos.'
          : 'No pudimos crear tu cuenta. Inténtalo de nuevo.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'signup' && result.data.user) {
      const { error: profileError } = await supabase.from('levelpi_users').insert({
        id: result.data.user.id,
        username: normalizedUsername,
      });

      if (profileError) {
        setError(profileError.code === '23505'
          ? 'Ese nombre ya está ocupado. Prueba con otro.'
          : 'Tu cuenta se creó, pero no pudimos guardar tu usuario.');
        setIsSubmitting(false);
        return;
      }
      setMessage('¡Listo! Tu cuenta de Levelπ ya está preparada.');
    } else {
      setMessage('¡Qué bueno verte de nuevo!');
    }
    setIsSubmitting(false);
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <button className="theme-toggle" onClick={() => setIsLight((current) => !current)} aria-label="Cambiar tema">
        {isLight ? <Moon size={18} /> : <Sun size={18} />}
        <span>{isLight ? 'Modo oscuro' : 'Modo claro'}</span>
      </button>

      <section className="auth-layout">
        <div className="auth-card">
          <div className="mascot-frame">
            <img src="/assets/images/image copy 2.png" alt="Logo de Levelπ" />
          </div>
          <div className="auth-content">
            <div className="card-heading">
              <div><span className="mini-label">BIENVENIDO A</span><h2>Level<span>π</span></h2></div>
              <div className="shape-icon"><Triangle size={20} /></div>
            </div>
            <p className="auth-intro">{mode === 'login' ? 'Continúa tu camino en la geometría.' : 'Crea tu cuenta y iniciar sesión.'}</p>

            <div className="mode-switch" role="tablist" aria-label="Tipo de acceso">
              <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')} role="tab" aria-selected={mode === 'login'}>Entrar</button>
              <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')} role="tab" aria-selected={mode === 'signup'}>Crear cuenta</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="username">Tu nombre</label>
              <div className="input-wrap"><UserRound size={18} /><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Escribe tu username" autoComplete="username" maxLength={20} /></div>
              <label htmlFor="password">Tu contraseña</label>
              <div className="input-wrap"><span className="password-dot">•••</span><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" className="password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              {error && <p className="form-message error">{error}</p>}
              {message && <p className="form-message success">{message}</p>}
              <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Preparando tu cuenta...' : mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}<ArrowRight size={19} /></button>
            </form>
            <p className="terms">Al continuar aceptas comenzar una aventura llena de formas y desafíos.</p>
          </div>
        </div>
      </section>
      <footer><span>Levelπ</span><span className="footer-dot">•</span><span></span></footer>
    </main>
  );
}

export default App;
