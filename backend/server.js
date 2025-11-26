const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/authors', require('./routes/authorRoutes'));
app.use('/api/novels', require('./routes/novelRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/chapters', require('./routes/chapterRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/reading-lists', require('./routes/readingListRoutes'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); })