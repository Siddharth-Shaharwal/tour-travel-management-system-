const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Test server running!' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login test' });
});

app.listen(4001, () => {
  console.log('Test server running on port 4001');
});
