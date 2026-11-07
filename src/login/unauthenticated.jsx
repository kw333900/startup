import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Unauthenticated({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  async function loginOrCreate(endpoint) {
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password }),
      });

      if (response.ok) {
        localStorage.setItem('userName', email.trim());
        onLogin(email.trim());
        navigate('/myratings');
      } else if (response.status === 409) {
        setError('That email already has an account. Try logging in.');
      } else if (response.status === 401) {
        setError('Wrong email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not reach the server.');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    loginOrCreate('/api/auth/login');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group mb-3">
        <span className="input-group-text">@</span>
        <input
          className="form-control"
          type="text"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="input-group mb-3">
        <span className="input-group-text">🔒</span>
        <input
          className="form-control"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Login</button>
      <button type="button" className="btn btn-secondary" onClick={() => loginOrCreate('/api/auth/create')}>Create</button>
      {error && <p className="mt-2">{error}</p>}
    </form>
  );
}