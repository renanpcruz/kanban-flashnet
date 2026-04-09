'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';
import InputField from '../components/ui/InputField/InputField';
import PrimaryButton from '../components/ui/PrimaryButton/PrimaryButton';
import { login } from '../lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Preencha usuário e senha.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await login(username.trim(), password);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Kanban Login</h1>

        <div className={styles.form}>
          <InputField
            label="Usuário"
            placeholder="Usuário"
            value={username}
            onChange={setUsername}
          />

          <InputField
            label="Senha"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={setPassword}
          />

          {error && <p className={styles.error}>{error}</p>}

          <PrimaryButton onClick={handleLogin} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </PrimaryButton>
        </div>

        <p className={styles.forgotPassword}>Esqueci a senha</p>
      </div>
    </div>
  );
}