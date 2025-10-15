require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  // useNewUrlParser: true, // Deprecated
  // useUnifiedTopology: true, // Deprecated
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/course', require('./routes/course'));
app.use('/api/progress', require('./routes/progress'));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
