const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { query } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from root and assests directory
app.use(express.static(path.join(__dirname)));

// Endpoint: Register User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: result.id, name, email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint: Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await query.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint: Subscribe to Newsletter
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const existing = await query.get('SELECT * FROM subscriptions WHERE email = ?', [email]);
    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
    }

    await query.run('INSERT INTO subscriptions (email) VALUES (?)', [email]);
    res.status(201).json({ message: 'Thank you for subscribing to our newsletter!' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint: Contact Messages
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    await query.run(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint: Submit Booking
app.post('/api/bookings', async (req, res) => {
  const { name, email, destination, date, travelers } = req.body;
  if (!name || !email || !destination || !date || !travelers) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const result = await query.run(
      'INSERT INTO bookings (name, email, destination, date, travelers) VALUES (?, ?, ?, ?, ?)',
      [name, email, destination, date, parseInt(travelers, 10)]
    );
    res.status(201).json({
      message: 'Booking created successfully!',
      booking: { id: result.id, name, email, destination, date, travelers }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Endpoint: Fetch Bookings
app.get('/api/bookings', async (req, res) => {
  const { email } = req.query;

  try {
    let bookings;
    if (email) {
      bookings = await query.all('SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC', [email]);
    } else {
      bookings = await query.all('SELECT * FROM bookings ORDER BY created_at DESC');
    }
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Serve frontend for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
