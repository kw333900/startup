const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// In-memory data. This will be replaced by a database in a later deliverable.
let users = [];

// Starting data standing in for other users. This will be replaced by real data in the database.
const SEED_MEMBERS = {
  'seed-joe': {
    name: 'Joe',
    criteria: 'Story and ending matter most. Cool effects never make up for a weak script.',
    ratings: [
      { id: 'joe-1', name: 'Terminator', rating: 9, date: '2022-03-14' },
      { id: 'joe-2', name: 'Shane', rating: 8, date: '2021-11-02' },
    ],
  },
  'seed-jill': {
    name: 'Jill',
    criteria: 'I rate how I felt when it ended and whether I want to watch it again.',
    ratings: [
      { id: 'jill-1', name: 'Barbie', rating: 7.5, date: '2023-07-22' },
      { id: 'jill-2', name: 'Inception', rating: 9.5, date: '2020-12-25' },
    ],
  },
  'seed-tim': {
    name: 'Tim',
    criteria: 'Classics set the bar. A 10 has to hold up decades later.',
    ratings: [{ id: 'tim-1', name: 'Casablanca', rating: 10, date: '2019-05-01' }],
  },
  'seed-sam': {
    name: 'Sam',
    criteria: 'Tension and craft. Great filmmaking beats a happy ending.',
    ratings: [
      { id: 'sam-1', name: 'Jaws', rating: 8.5, date: '2022-08-09' },
      { id: 'sam-2', name: 'Alien', rating: 9, date: '2021-10-31' },
    ],
  },
  'seed-ava': {
    name: 'Ava',
    criteria: 'Characters first. If I do not care about them, the rest does not matter.',
    ratings: [{ id: 'ava-1', name: 'Titanic', rating: 7, date: '2020-02-14' }],
  },
  'seed-noah': {
    name: 'Noah',
    criteria: 'Ambition and scale, and whether it earns its length.',
    ratings: [{ id: 'noah-1', name: 'Gladiator', rating: 9, date: '2023-01-15' }],
  },
  'seed-mia': {
    name: 'Mia',
    criteria: 'Heart and originality. Bonus points for making me laugh.',
    ratings: [{ id: 'mia-1', name: 'Up', rating: 8, date: '2022-06-30' }],
  },
};

// Groups hold member ids, never email addresses
const groups = [
  { name: 'MyFam', members: ['seed-joe', 'seed-jill', 'seed-tim'] },
  { name: 'MyFriends', members: ['seed-sam', 'seed-ava'] },
  { name: 'MovieBuffs', members: ['seed-noah', 'seed-mia'] },
];

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// Create a new account
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({ msg: 'Email and password required' });
    return;
  }
  if (await findUser('email', email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(email, password);
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// Log in an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// Log out
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Guard for endpoints that need a logged-in user
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Get the logged-in user's ratings
apiRouter.get('/ratings', verifyAuth, (req, res) => {
  res.send(req.user.ratings);
});

// Add a rating for the logged-in user
apiRouter.post('/ratings', verifyAuth, (req, res) => {
  const { name, rating, date } = req.body;
  const valid =
    typeof name === 'string' &&
    name.trim() !== '' &&
    typeof rating === 'number' &&
    Number.isFinite(rating) &&
    rating >= 0 &&
    rating <= 10 &&
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date);

  if (!valid) {
    res.status(400).send({ msg: 'A name, a rating from 0 to 10, and a date (YYYY-MM-DD) are required' });
    return;
  }

  req.user.ratings.push({ id: uuid.v4(), name: name.trim(), rating: rating, date: date });
  res.send(req.user.ratings);
});

// Get the logged-in user's criteria text
apiRouter.get('/criteria', verifyAuth, (req, res) => {
  res.send({ criteria: req.user.criteria });
});

// Save the logged-in user's criteria text
apiRouter.put('/criteria', verifyAuth, (req, res) => {
  const { criteria } = req.body;
  if (typeof criteria !== 'string' || criteria.length > 2000) {
    res.status(400).send({ msg: 'Criteria must be text of 2000 characters or fewer' });
    return;
  }
  req.user.criteria = criteria;
  res.send({ criteria: req.user.criteria });
});

// Get the groups the logged-in user belongs to
apiRouter.get('/groups', verifyAuth, (req, res) => {
  const mine = groups
    .filter((g) => g.members.includes(req.user.id))
    .map((g) => ({ name: g.name, memberCount: g.members.length }));
  res.send(mine);
});

// Join a group by name
apiRouter.post('/groups/join', verifyAuth, (req, res) => {
  const wanted = typeof req.body.name === 'string' ? req.body.name.trim().toLowerCase() : '';
  const group = groups.find((g) => g.name.toLowerCase() === wanted);
  if (!group) {
    res.status(404).send({ msg: 'No group with that name' });
    return;
  }
  if (group.members.includes(req.user.id)) {
    res.status(409).send({ msg: 'Already a member' });
    return;
  }
  group.members.push(req.user.id);
  res.send({ name: group.name });
});

// Get the members of one of the user's groups
apiRouter.get('/groups/:groupName', verifyAuth, (req, res) => {
  const group = groups.find((g) => g.name === req.params.groupName);
  if (!group || !group.members.includes(req.user.id)) {
    res.status(404).send({ msg: 'Group not found' });
    return;
  }
  const members = group.members.map((id) => ({
    id: id,
    name: getMember(id).name,
    isYou: id === req.user.id,
  }));
  res.send({ name: group.name, members: members });
});

// Get one member's ratings and criteria. Both people must be in the group.
apiRouter.get('/groups/:groupName/members/:memberId', verifyAuth, (req, res) => {
  const group = groups.find((g) => g.name === req.params.groupName);
  const memberId = req.params.memberId;
  if (!group || !group.members.includes(req.user.id) || !group.members.includes(memberId)) {
    res.status(404).send({ msg: 'Member not found' });
    return;
  }
  const member = getMember(memberId);
  res.send({
    name: member.name,
    isYou: memberId === req.user.id,
    ratings: member.ratings,
    criteria: member.criteria,
  });
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Any unknown path returns the app's main page, so refreshing on /groups works
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuid.v4(),
    email: email,
    password: passwordHash,
    token: uuid.v4(),
    ratings: [],
    criteria: '',
  };
  users.push(user);

  // New accounts start in these groups until there is a way to create groups
  groups.forEach((g) => {
    if (g.name === 'MyFam' || g.name === 'MyFriends') {
      g.members.push(user.id);
    }
  });

  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field] === value);
}

// A group member is either a seed member or a real user. Real users show as the part of the email before the @.
function getMember(id) {
  if (SEED_MEMBERS[id]) return SEED_MEMBERS[id];
  const user = users.find((u) => u.id === id);
  return { name: user.email.split('@')[0], ratings: user.ratings, criteria: user.criteria };
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});