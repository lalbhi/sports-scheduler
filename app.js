require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const cookieParser = require('cookie-parser');

const app = express();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true
});

app.use(cookieParser());

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(bodyParser.urlencoded({ extended: true }));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// Initialize events array (for demonstration purposes)
let events = [];

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.post('/admin', (req, res) => {
  const newEvent = {
    id: events.length + 1,
    name: req.body.name,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
  };
  events.push(newEvent);
  res.redirect('/user');
});

app.get('/user', (req, res) => {
  res.render('user', { events: events });
});

app.get('/signin', (req, res) => {
  res.render('signin', { csrfToken: req.csrfToken() });
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        return res.redirect('/');
      }
    }
    res.redirect('/signin');
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/signup', (req, res) => {
  res.render('signup', { csrfToken: req.csrfToken() });
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Internal Server Error');
  }
});

sequelize.sync()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });
