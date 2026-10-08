import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {

  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/myratings');
  }


  return (
       <main>
      <h1>Welcome to T.N. Ratings</h1>
      <form onSubmit={handleSubmit}>
  <div className="input-group mb-3">
    <span className="input-group-text">@</span>
    <input className="form-control" type="text" placeholder="your@email.com" />
  </div>
  <div className="input-group mb-3">
    <span className="input-group-text">🔒</span>
    <input className="form-control" type="password" placeholder="password" />
  </div>
  <button type="submit" className="btn btn-primary">Login</button>
  <button type="submit" className="btn btn-secondary">Create</button>
</form>
    </main>
  );
}