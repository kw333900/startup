import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './groups/groups';
import { Scores } from './myratings/myratings';
import { About } from './about/about';

export default function App() {
  return (
    <BrowserRouter>
    <div className="body bg-dark text-light">
      <header>
			<h1>T.N. Ratings<sup>&reg;</sup></h1>

			<nav>
      <menu>
        <li><NavLink to="">Home</NavLink></li>
        <li><NavLink to="myratings">MyRatings</NavLink></li>
        <li><NavLink to="groups">Groups</NavLink></li>
        <li><NavLink to="about">About</NavLink></li>
      </menu>
    </nav>

			<hr />
		</header>



    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/myratings' element={<MyRatings />} />
      <Route path='/groups' element={<Groups />} />
      <Route path='/about' element={<About />} />
      <Route path='*' element={<NotFound />} />
    </Routes>


        <footer>
          <hr />
          <span className="text-reset">Author Name(s)</span>
          <br />
          <a href="https://github.com/kw333900/startup">GitHub</a>
      </footer>
    </div>
    </BrowserRouter>
  );
}


function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}