import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { AuthState } from './login/authState';
import { Groups } from './groups/groups';
import { MyRatings } from './myratings/myratings';
import { About } from './about/about';

export default function App() {
  const [userName, setUserName] = React.useState(localStorage.getItem('userName') || '');
  const [authState, setAuthState] = React.useState(
    userName ? AuthState.Authenticated : AuthState.Unauthenticated
  );

  return (
    <BrowserRouter>
      <div className="body bg-dark text-light">
        <header>
          <h1>T.N. Ratings<sup>&reg;</sup></h1>

          <nav>
            <menu>
              <li><NavLink to="/">Login</NavLink></li>
              {authState === AuthState.Authenticated && (
                <li><NavLink to="myratings">MyRatings</NavLink></li>
              )}
              {authState === AuthState.Authenticated && (
                <li><NavLink to="groups">Groups</NavLink></li>
              )}
              <li><NavLink to="about">About</NavLink></li>
            </menu>
          </nav>

          <hr />
        </header>

        <Routes>
          <Route
            path='/'
            element={
              <Login
                userName={userName}
                authState={authState}
                onAuthChange={(userName, authState) => {
                  setAuthState(authState);
                  setUserName(userName);
                }}
              />
            }
          />
          <Route path='/myratings' element={<MyRatings />} />
          <Route path='/groups' element={<Groups />} />
          <Route path='/about' element={<About />} />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <footer className="d-flex flex-column align-items-start text-start">
          <hr className="w-100" />
          <span className="text-reset">Kody Wastlund</span>
          <a href="https://github.com/kw333900/startup">GitHub</a>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}