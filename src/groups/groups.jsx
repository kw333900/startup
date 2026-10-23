import React from 'react';
import './groups.css';

const YOU = 'You';

// This will be replaced with data from the database
const INITIAL_GROUPS = [
  {
    name: 'MyFam',
    members: [
      {
        name: 'Joe',
        ratings: [
          { id: 1, name: 'Terminator', rating: 9, date: '2022-03-14' },
          { id: 2, name: 'Shane', rating: 8, date: '2021-11-02' },
        ],
      },
      {
        name: 'Jill',
        ratings: [
          { id: 1, name: 'Barbie', rating: 7.5, date: '2023-07-22' },
          { id: 2, name: 'Inception', rating: 9.5, date: '2020-12-25' },
        ],
      },
      {
        name: 'Tim',
        ratings: [{ id: 1, name: 'Casablanca', rating: 10, date: '2019-05-01' }],
      },
      { name: YOU, ratings: [] },
    ],
  },
  {
    name: 'MyFriends',
    members: [
      {
        name: 'Sam',
        ratings: [
          { id: 1, name: 'Jaws', rating: 8.5, date: '2022-08-09' },
          { id: 2, name: 'Alien', rating: 9, date: '2021-10-31' },
        ],
      },
      {
        name: 'Ava',
        ratings: [{ id: 1, name: 'Titanic', rating: 7, date: '2020-02-14' }],
      },
      { name: YOU, ratings: [] },
    ],
  },
  {
    name: 'MovieBuffs',
    members: [
      {
        name: 'Noah',
        ratings: [{ id: 1, name: 'Gladiator', rating: 9, date: '2023-01-15' }],
      },
      {
        name: 'Mia',
        ratings: [{ id: 1, name: 'Up', rating: 8, date: '2022-06-30' }],
      },
    ],
  },
];

// This will be replaced with data from the database
const CRITERIA = {
  Joe: 'hard code placeholder',
  Jill: 'hard code placeholder',
  Tim: 'hard code placeholder',
  Sam: 'hard code placeholder',
  Ava: 'hard code placeholder',
  Noah: 'hard code placeholder',
  Mia: 'hard code placeholder',
};

function loadMyRatings() {
  const saved = localStorage.getItem('ratings');
  return saved ? JSON.parse(saved) : [];
}

function loadMyCriteria() {
  return localStorage.getItem('criteria') || '';
}

function sortedRatings(list) {
  return [...list].sort((a, b) => b.rating - a.rating);
}

export function Groups() {
  const [groups, setGroups] = React.useState(INITIAL_GROUPS);
  const [myRatings] = React.useState(loadMyRatings);
  const [myCriteria] = React.useState(loadMyCriteria);
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [joinName, setJoinName] = React.useState('');
  const [joinMessage, setJoinMessage] = React.useState('');

  React.useEffect(() => {
    // This will be replaced with WebSocket messages later
    const timer = setInterval(() => {
      const options = [];
      groups
        .filter((g) => g.members.some((m) => m.name === YOU))
        .forEach((g) => {
          g.members
            .filter((m) => m.name !== YOU)
            .forEach((m) => {
              m.ratings.forEach((r) => {
                options.push({ group: g.name, member: m.name, movie: r.name });
              });
            });
        });
      if (options.length === 0) return;

      const pick = options[Math.floor(Math.random() * options.length)];
      const text = `${pick.member} rated "${pick.movie}" in ${pick.group}`;
      setNotifications((prev) => [{ id: Date.now(), text }, ...prev].slice(0, 5));
    }, 5000);

    return () => clearInterval(timer);
  }, [groups]);

  function handleJoin(event) {
    event.preventDefault();
    const wanted = joinName.trim().toLowerCase();
    const target = groups.find((g) => g.name.toLowerCase() === wanted);

    if (!target) {
      setJoinMessage(`No group named "${joinName.trim()}" was found.`);
      return;
    }
    if (target.members.some((m) => m.name === YOU)) {
      setJoinMessage(`You're already in ${target.name}.`);
      return;
    }

    // This will be replaced with a call to the join endpoint
    setGroups(
      groups.map((g) =>
        g === target ? { ...g, members: [...g.members, { name: YOU, ratings: [] }] } : g
      )
    );
    setJoinMessage(`You joined ${target.name}!`);
    setJoinName('');
  }

  const myGroups = groups.filter((g) => g.members.some((m) => m.name === YOU));
  const group = selectedGroup ? groups.find((g) => g.name === selectedGroup) : null;
  const member = group && selectedMember ? group.members.find((m) => m.name === selectedMember) : null;

  let content;

  if (member) {
    const ratings = sortedRatings(member.name === YOU ? myRatings : member.ratings);
    const criteria = member.name === YOU ? myCriteria : CRITERIA[member.name];
    content = (
      <>
        <button type="button" className="btn btn-secondary mb-3" onClick={() => setSelectedMember(null)}>
          &larr; Back to {group.name}
        </button>
        <h2>{member.name === YOU ? 'Your ratings' : `${member.name}'s ratings`}</h2>
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
              <tbody>
                {ratings.length === 0 ? (
                  <tr>
                    <td colSpan="4">No ratings yet</td>
                  </tr>
                ) : (
                  ratings.map((r, i) => (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{r.name}</td>
                      <td>{r.rating}</td>
                      <td>{r.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="col-md-4">
            <div className="border rounded p-3">
              <h3 className="h5">MyRating Criteria:</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{criteria || 'No criteria written yet.'}</p>
            </div>
          </div>
        </div>
      </>
    );
  } else if (group) {
    content = (
      <>
        <button type="button" className="btn btn-secondary mb-3" onClick={() => setSelectedGroup(null)}>
          &larr; Back to groups
        </button>
        <h2>{group.name}</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Member</th>
            </tr>
          </thead>
          <tbody>
            {group.members.map((m) => (
              <tr key={m.name}>
                <td>
                  <button type="button" className="btn btn-link p-0" onClick={() => setSelectedMember(m.name)}>
                    {m.name}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  } else {
    content = (
      <>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Group</th>
              <th># of Members</th>
            </tr>
          </thead>
          <tbody>
            {myGroups.length === 0 ? (
              <tr>
                <td colSpan="2">You haven't joined any groups yet</td>
              </tr>
            ) : (
              myGroups.map((g) => (
                <tr key={g.name}>
                  <td>
                    <button type="button" className="btn btn-link p-0" onClick={() => setSelectedGroup(g.name)}>
                      {g.name}
                    </button>
                  </td>
                  <td>{g.members.length}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <form onSubmit={handleJoin} className="input-group mb-2">
          <input
            className="form-control"
            type="text"
            placeholder="group name to join (try MovieBuffs)"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Join
          </button>
        </form>
        {joinMessage && <p>{joinMessage}</p>}
      </>
    );
  }

  return (
    <main>
      <ul className="notification">
        {notifications.length === 0 ? (
          <li className="player-name">No group activity yet</li>
        ) : (
          notifications.map((n) => (
            <li key={n.id} className="player-name">
              {n.text}
            </li>
          ))
        )}
      </ul>

      {content}
    </main>
  );
}