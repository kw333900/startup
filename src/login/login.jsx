import React from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_QUOTES = [
  { quote: "I'll be back.", show: 'The Terminator' },
  { quote: "You can't handle the truth!", show: 'A Few Good Men' }
  // { quote: 'May the Force be with you.', show: 'Star Wars' },
];

// This will be replaced with a call to the quote service
function getRandomQuote() {
  return MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)];
}

export function Login() {

  const navigate = useNavigate();
  const [quote, setQuote] = React.useState({ quote: 'Loading...', show: '' });

  React.useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

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

            <blockquote className="blockquote mt-5">
        <p className="mb-0">&ldquo;{quote.quote}&rdquo;</p>
        <div className="blockquote-footer mt-3">{quote.show}</div>
      </blockquote>
    </main>
  );
}