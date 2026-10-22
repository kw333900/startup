import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Authenticated({ userName, onLogout }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('userName');
    onLogout();
  }

  return (
    <div>
      <p>Welcome back, {userName}</p>
      <button type="button" className="btn btn-primary" onClick={() => navigate('/myratings')}>
        MyRatings
      </button>{' '}
      <button type="button" className="btn btn-secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}