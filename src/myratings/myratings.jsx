import React from 'react';
import { useNavigate } from 'react-router-dom';
import './myratings.css';

export function MyRatings({ onUnauthorized }) {
  const navigate = useNavigate();
  const [ratings, setRatings] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [date, setDate] = React.useState('');
  const [message, setMessage] = React.useState('');

  const [criteria, setCriteria] = React.useState('');
  const [editingCriteria, setEditingCriteria] = React.useState(false);
  const [criteriaDraft, setCriteriaDraft] = React.useState('');

  function handleUnauthorized() {
    onUnauthorized();
    navigate('/');
  }

  React.useEffect(() => {
    async function load() {
      try {
        const [ratingsRes, criteriaRes] = await Promise.all([
          fetch('/api/ratings'),
          fetch('/api/criteria'),
        ]);
        if (ratingsRes.status === 401 || criteriaRes.status === 401) {
          handleUnauthorized();
          return;
        }
        const ratingsData = await ratingsRes.json();
        const criteriaData = await criteriaRes.json();
        setRatings(ratingsData);
        setCriteria(criteriaData.criteria);
        setCriteriaDraft(criteriaData.criteria);
        setEditingCriteria(criteriaData.criteria === '');
      } catch {
        setMessage('Could not reach the server.');
      }
    }
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), rating: Number(rating), date: date }),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        setMessage('Could not save that rating.');
        return;
      }
      setRatings(await response.json());
      setMessage('');
      setName('');
      setRating('');
      setDate('');
      setShowForm(false);
    } catch {
      setMessage('Could not reach the server.');
    }
  }

  function startEditingCriteria() {
    setCriteriaDraft(criteria);
    setEditingCriteria(true);
  }

  async function saveCriteria() {
    try {
      const response = await fetch('/api/criteria', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria: criteriaDraft.trim() }),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) {
        setMessage('Could not save your criteria.');
        return;
      }
      const data = await response.json();
      setCriteria(data.criteria);
      setMessage('');
      setEditingCriteria(false);
    } catch {
      setMessage('Could not reach the server.');
    }
  }

  const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);

  const rows =
    sortedRatings.length === 0 ? (
      <tr>
        <td colSpan="4">No ratings yet</td>
      </tr>
    ) : (
      sortedRatings.map((r, i) => (
        <tr key={r.id}>
          <td>{i + 1}</td>
          <td>{r.name}</td>
          <td>{r.rating}</td>
          <td>{r.date}</td>
        </tr>
      ))
    );

  return (
    <main>
      {message && <p>{message}</p>}

      <div className="d-flex justify-content-end mb-2">
        <button
          type="button"
          className="btn btn-primary"
          aria-label={showForm ? 'Close add rating form' : 'Add rating'}
          onClick={() => setShowForm(!showForm)}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>
            {showForm ? '×' : '+'}
          </span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="input-group mb-2">
            <span className="input-group-text">Name</span>
            <input
              className="form-control"
              type="text"
              placeholder="movie or show"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-2">
            <span className="input-group-text">Rating</span>
            <input
              className="form-control"
              type="number"
              min="0"
              max="10"
              step="any"
              placeholder="0 - 10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-2">
            <span className="input-group-text">Date</span>
            <input
              className="form-control"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Add</button>{' '}
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      )}

      <div className="row">
        <div className="col-md-8">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </div>

        <div className="col-md-4">
          <div className="border rounded p-3">
            <h2 className="h5">MyRating Criteria:</h2>
            {editingCriteria ? (
              <>
                <textarea
                  className="form-control mb-2"
                  rows="6"
                  placeholder="What do you look for when you rate a movie?"
                  value={criteriaDraft}
                  onChange={(e) => setCriteriaDraft(e.target.value)}
                />
                <button type="button" className="btn btn-primary" onClick={saveCriteria}>
                  Save
                </button>{' '}
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCriteria(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p style={{ whiteSpace: 'pre-wrap' }}>{criteria || 'No criteria written yet.'}</p>
                <button type="button" className="btn btn-secondary" onClick={startEditingCriteria}>
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}