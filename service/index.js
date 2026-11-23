const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const DB = require('./database.js');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;
let httpServer;

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

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.post('/auth/create', async (req, res) => {
  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    res.status(400).send({ msg: 'Email and password required' });
    return;
  }

  if (await DB.findUser('email', email)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuid.v4(),
    email,
    password: passwordHash,
    token: uuid.v4(),
    ratings: [],
    criteria: '',
  };

  try {
    await DB.addUser(user);
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).send({ msg: 'Existing user' });
      return;
    }
    throw err;
  }

  setAuthCookie(res, user.token);
  res.send({ email: user.email });
});

apiRouter.post('/auth/login', async (req, res) => {
  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const user = await DB.findUser('email', email);

  if (user && password && (await bcrypt.compare(password, user.password))) {
    const token = uuid.v4();
    await DB.updateUserToken(user.id, token);
    setAuthCookie(res, token);
    res.send({ email: user.email });
    return;
  }

  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await DB.findUser('token', req.cookies[authCookieName]);
  if (user) await DB.removeUserToken(user.id);
  res.clearCookie(authCookieName);
  res.status(204).end();
});

const verifyAuth = async (req, res, next) => {
  const user = await DB.findUser('token', req.cookies[authCookieName]);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
};

apiRouter.get('/ratings', verifyAuth, (req, res) => {
  res.send(req.user.ratings ?? []);
});

apiRouter.post('/ratings', verifyAuth, async (req, res) => {
  const body = req.body ?? {};
  const { name, rating, date } = body;
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

  const ratings = await DB.addRating(req.user.id, {
    id: uuid.v4(),
    name: name.trim(),
    rating,
    date,
  });
  res.send(ratings);
});

apiRouter.get('/criteria', verifyAuth, (req, res) => {
  res.send({ criteria: req.user.criteria ?? '' });
});

apiRouter.put('/criteria', verifyAuth, async (req, res) => {
  const criteria = req.body?.criteria;
  if (typeof criteria !== 'string' || criteria.length > 2000) {
    res.status(400).send({ msg: 'Criteria must be text of 2000 characters or fewer' });
    return;
  }

  await DB.updateCriteria(req.user.id, criteria);
  res.send({ criteria });
});

apiRouter.get('/groups', verifyAuth, async (req, res) => {
  const groups = await DB.getGroupsForUser(req.user.id);
  res.send(groups.map((group) => ({ name: group.name, memberCount: group.members.length })));
});

apiRouter.post('/groups/join', verifyAuth, async (req, res) => {
  const wanted = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const group = await DB.findGroupByName(wanted);
  if (!group) {
    res.status(404).send({ msg: 'No group with that name' });
    return;
  }
  if (group.members.includes(req.user.id)) {
    res.status(409).send({ msg: 'Already a member' });
    return;
  }

  await DB.addGroupMember(group.name, req.user.id);
  res.send({ name: group.name });
});

apiRouter.get('/groups/:groupName', verifyAuth, async (req, res) => {
  const group = await DB.findGroupByName(req.params.groupName);
  if (!group || !group.members.includes(req.user.id)) {
    res.status(404).send({ msg: 'Group not found' });
    return;
  }

  const members = await Promise.all(
    group.members.map(async (id) => {
      const member = await getMember(id);
      return member && { id, name: member.name, isYou: id === req.user.id };
    })
  );
  res.send({ name: group.name, members: members.filter(Boolean) });
});

apiRouter.get('/groups/:groupName/members/:memberId', verifyAuth, async (req, res) => {
  const group = await DB.findGroupByName(req.params.groupName);
  const memberId = req.params.memberId;
  if (!group || !group.members.includes(req.user.id) || !group.members.includes(memberId)) {
    res.status(404).send({ msg: 'Member not found' });
    return;
  }

  const member = await getMember(memberId);
  if (!member) {
    res.status(404).send({ msg: 'Member not found' });
    return;
  }

  res.send({
    name: member.name,
    isYou: memberId === req.user.id,
    ratings: member.ratings,
    criteria: member.criteria,
  });
});

app.use((err, req, res, next) => {
  console.error(`Request failed: ${err.name}: ${err.message}`);
  res.status(500).send({ msg: 'Internal server error' });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function getMember(id) {
  if (SEED_MEMBERS[id]) return SEED_MEMBERS[id];
  const user = await DB.findUser('id', id);
  if (!user) return null;
  return {
    name: user.email.split('@')[0],
    ratings: user.ratings ?? [],
    criteria: user.criteria ?? '',
  };
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

async function start() {
  await DB.connect();
  httpServer = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

async function shutdown() {
  if (httpServer) {
    httpServer.close(async () => {
      await DB.close();
      process.exit(0);
    });
    return;
  }
  await DB.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error(`Unable to start service: ${err.name}: ${err.message}`);
  process.exit(1);
});
