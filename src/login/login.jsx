import React from 'react';

export function Login() {
  return (
       <main>
      <h1>Welcome to T.N. Ratings</h1>
      <form method="get" action="myratings.html">
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