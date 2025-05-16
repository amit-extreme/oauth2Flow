const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`Authorization server running on http://localhost:${PORT}`);
});
