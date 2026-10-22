import React from 'react';
import './myratings.css';

const STARTER_RATINGS = [
  { id: 1, name: 'Inception', rating: 10, date: '2021-05-20' },
  { id: 2, name: 'Barbie', rating: 9, date: '2021-06-02' },
  { id: 3, name: 'Shane', rating: 8.5, date: '2020-07-03' },
];

export function MyRatings() {
  const [ratings, setRatings] = React.useState(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : STARTER_RATINGS;
  });
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [date, setDate] = React.useState('');

  React.useEffect(() => {
    localStorage.setItem('ratings', JSON.stringify(ratings));
  }, [ratings]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    const newRating = {
      id: Date.now(),
      name: name.trim(),
      rating: Number(rating),
      date: date,
    };

    setRatings([...ratings, newRating]);
    setName('');
    setRating('');
    setDate('');
    setShowForm(false);
  }

const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);

  const rows = sortedRatings.map((r, i) => (
    <tr key={r.id}>
      <td>{i + 1}</td>
      <td>{r.name}</td>
      <td>{r.rating}</td>
      <td>{r.date}</td>
    </tr>
  ));

  return (
    <main>
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
    </main>
  );
}