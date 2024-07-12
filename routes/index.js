const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/home');
});

router.get('/register', (req, res) => {
  res.render('pages/register');
});

router.post('/register', (req, res) => {
  // Register user logic here
  res.redirect('/login');
});

router.get('/login', (req, res) => {
  res.render('pages/login');
});

router.post('/login', (req, res) => {
  // Login user logic here
  res.redirect('/dashboard');
});

router.get('/join', (req, res) => {
  res.render('pages/join');
});

router.post('/join', (req, res) => {
  // Join user logic here
  res.redirect('/dashboard');
});

router.get('/dashboard', (req, res) => {
  res.render('pages/dashboard');
});

module.exports = router;