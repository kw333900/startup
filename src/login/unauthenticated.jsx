import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Unauthenticated({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  // This will be replaced with calls to the login and create endpoints
  function loginOrCreate() {
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    localStorage.setItem('userName', email.trim());
    onLogin(email.trim());
    navigate('/myratings');
  }

  function handleSubmit(event) {
    event.preventDefault();
    loginOrCreate();
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
      <button type="button" className="btn btn-secondary" onClick={loginOrCreate}>Create</button>
      {error && <p className="mt-2">{error}</p>}
    </form>
  );
}