import React from 'react';
import { AuthState } from './authState';
import { Authenticated } from './authenticated';
import { Unauthenticated } from './unauthenticated';

export function Login({ userName, authState, onAuthChange }) {
  const [quote, setQuote] = React.useState(null);

  React.useEffect(() => {
    fetch('https://quote.cs260.click')
      .then((response) => response.json())
      .then((data) => {
        if (data.quote) {
          setQuote({ text: data.quote, author: data.author });
        }
      })
      .catch(() => {
        // The quote is optional, so the page still works without it
      });
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

      {quote && (
        <blockquote className="blockquote mt-5">
          <p className="mb-0">&ldquo;{quote.text}&rdquo;</p>
          <div className="blockquote-footer mt-3">{quote.author}</div>
        </blockquote>
      )}
    </main>
  );
}