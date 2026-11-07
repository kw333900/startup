import React from 'react';
import { useNavigate } from 'react-router-dom';
import './groups.css';

// This will be replaced with WebSocket messages
const NOTIFICATION_POOL = [
  { group: 'MyFam', member: 'Joe', movie: 'Terminator' },
  { group: 'MyFam', member: 'Jill', movie: 'Barbie' },
  { group: 'MyFam', member: 'Tim', movie: 'Casablanca' },
  { group: 'MyFriends', member: 'Sam', movie: 'Jaws' },
  { group: 'MyFriends', member: 'Ava', movie: 'Titanic' },
  { group: 'MovieBuffs', member: 'Noah', movie: 'Gladiator' },
  { group: 'MovieBuffs', member: 'Mia', movie: 'Up' },
];

function sortedRatings(list) {
  return [...list].sort((a, b) => b.rating - a.rating);
}

export function Groups({ onUnauthorized }) {
  const navigate = useNavigate();
  const [groups, setGroups] = React.useState([]);
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [groupDetail, setGroupDetail] = React.useState(null);
  const [selectedMember, setSelectedMember] = React.useState(null);
  const [memberDetail, setMemberDetail] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [joinName, setJoinName] = React.useState('');
  const [joinMessage, setJoinMessage] = React.useState('');
  const [message, setMessage] = React.useState('');

  function handleUnauthorized() {
    onUnauthorized();
    navigate('/');
  }

  async function apiGet(path) {
    try {
      const response = await fetch(path);
      if (response.status === 401) {
        handleUnauthorized();
        return null;
      }
      if (!response.ok) {
        setMessage('Could not load that.');
        return null;
      }
      setMessage('');
      return await response.json();
    } catch {
      setMessage('Could not reach the server.');
      return null;
    }
  }

  async function loadGroups() {
    const data = await apiGet('/api/groups');
    if (data) setGroups(data);
  }

  React.useEffect(() => {
    loadGroups();
  }, []);

  React.useEffect(() => {
    if (!selectedGroup) return;
    (async () => {
      const data = await apiGet(`/api/groups/${encodeURIComponent(selectedGroup)}`);
      if (data) setGroupDetail(data);
    })();
  }, [selectedGroup]);

  React.useEffect(() => {
    if (!selectedGroup || !selectedMember) return;
    (async () => {
      const data = await apiGet(
        `/api/groups/${encodeURIComponent(selectedGroup)}/members/${encodeURIComponent(selectedMember)}`
      );
      if (data) setMemberDetail(data);
    })();
  }, [selectedMember]);

  React.useEffect(() => {
    // This will be replaced with WebSocket messages
    const timer = setInterval(() => {
      const names = groups.map((g) => g.name);
      const options = NOTIFICATION_POOL.filter((n) => names.includes(n.group));
      if (options.length === 0) return;

      const pick = options[Math.floor(Math.random() * options.length)];
      const text = `${pick.member} rated "${pick.movie}" in ${pick.group}`;
      setNotifications((prev) => [{ id: Date.now(), text }, ...prev].slice(0, 5));
    }, 5000);

    return () => clearInterval(timer);
  }, [groups]);

  function openGroup(name) {
    setGroupDetail(null);
    setSelectedGroup(name);
  }

  function closeGroup() {
    setSelectedMember(null);
    setMemberDetail(null);
    setSelectedGroup(null);
    setGroupDetail(null);
  }

  function openMember(id) {
    setMemberDetail(null);
    setSelectedMember(id);
  }

  function closeMember() {
    setSelectedMember(null);
    setMemberDetail(null);
  }

  async function handleJoin(event) {
    event.preventDefault();
    const wanted = joinName.trim();
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: wanted }),
      });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setJoinMessage(`You joined ${data.name}!`);
        setJoinName('');
        loadGroups();
      } else if (response.status === 404) {
        setJoinMessage(`No group named "${wanted}" was found.`);
      } else if (response.status === 409) {
        setJoinMessage(`You're already in "${wanted}".`);
      } else {
        setJoinMessage('Could not join that group.');
      }
    } catch {
      setJoinMessage('Could not reach the server.');
    }
  }

  let content;

  if (selectedGroup && selectedMember) {
    if (!memberDetail) {
      content = <p>Loading...</p>;
    } else {
      const ratings = sortedRatings(memberDetail.ratings);
      content = (
        <>
          <button type="button" className="btn btn-secondary mb-3" onClick={closeMember}>
            &larr; Back to {selectedGroup}
          </button>
          <h2>{memberDetail.isYou ? 'Your ratings' : `${memberDetail.name}'s ratings`}</h2>
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
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {memberDetail.criteria || 'No criteria written yet.'}
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }
  } else if (selectedGroup) {
    if (!groupDetail) {
      content = <p>Loading...</p>;
    } else {
      content = (
        <>
          <button type="button" className="btn btn-secondary mb-3" onClick={closeGroup}>
            &larr; Back to groups
          </button>
          <h2>{groupDetail.name}</h2>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Member</th>
              </tr>
            </thead>
            <tbody>
              {groupDetail.members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <button type="button" className="btn btn-link p-0" onClick={() => openMember(m.id)}>
                      {m.name}
                    </button>
                    {m.isYou && ' (you)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }
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
            {groups.length === 0 ? (
              <tr>
                <td colSpan="2">You haven't joined any groups yet</td>
              </tr>
            ) : (
              groups.map((g) => (
                <tr key={g.name}>
                  <td>
                    <button type="button" className="btn btn-link p-0" onClick={() => openGroup(g.name)}>
                      {g.name}
                    </button>
                  </td>
                  <td>{g.memberCount}</td>
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

      {message && <p>{message}</p>}

      {content}
    </main>
  );
}