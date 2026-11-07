const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const app = express();
const authCookieName = 'token';
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// In-memory data. This will be replaced by a database in a later deliverable.
let users = [];

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
    email: email,
    password: passwordHash,
    token: uuid.v4(),
    ratings: [],
    criteria: '',
  };
  users.push(user);
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  return users.find((u) => u[field] === value);
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