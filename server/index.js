require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  'https://learning-platform-frontend-qjwx.onrender.com', // deployed frontend
  'http://localhost:8080', // local dev
  'https://*.onrender.com' // Allow all subdomains for Render deployment
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    // Check if the origin is in the allowed list directly
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Check for wildcard origins (e.g., *.onrender.com)
    const isWildcardAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.startsWith('https://*.') && origin.startsWith('https://')) {
        const domain = allowedOrigin.substring(allowedOrigin.indexOf('.') + 1);
        return origin.endsWith(domain);
      }
      return false;
    });

    if (isWildcardAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // allow cookies/auth headers if needed
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// MongoDB connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// Routes
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/course', require('./routes/course'));
app.use('/api/progress', require('./routes/progress'));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
