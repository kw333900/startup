import React from 'react';
import { AuthState } from './authState';
import { Authenticated } from './authenticated';
import { Unauthenticated } from './unauthenticated';

const MOCK_QUOTES = [
  { quote: "I'll be back.", show: 'The Terminator' },
  { quote: "You can't handle the truth!", show: 'A Few Good Men' },
  { quote: 'May the Force be with you.', show: 'Star Wars' },
];

// This will be replaced with a call to the quote service later
function getRandomQuote() {
  return MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)];
}

export function Login({ userName, authState, onAuthChange }) {
  const [quote, setQuote] = React.useState({ quote: 'Loading...', show: '' });

  React.useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  return (
    <main>
      <h1>Welcome to T.N. Ratings</h1>

      {authState === AuthState.Authenticated && (
        <Authenticated
          userName={userName}
          onLogout={() => onAuthChange('', AuthState.Unauthenticated)}
        />
      )}
      {authState === AuthState.Unauthenticated && (
        <Unauthenticated
          onLogin={(loginUserName) => onAuthChange(loginUserName, AuthState.Authenticated)}
        />
      )}

      <blockquote className="blockquote mt-5">
        <p className="mb-0">&ldquo;{quote.quote}&rdquo;</p>
        <div className="blockquote-footer mt-3">{quote.show}</div>
      </blockquote>
    </main>
  );
}