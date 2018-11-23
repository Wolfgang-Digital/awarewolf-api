if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: '../.env' });

import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import validator from 'express-validator';
import compression from 'compression';
import { auth, awarewolf, user, watson } from './routes';
import { verifyJwt } from './utils';

const app = express();

const PORT = process.env.PORT || 3001;
const DB_URI = process.env.NODE_ENV === 'production' ? process.env.DB_URI : process.env.TEST_DB_URI;

// Middleware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(validator());
app.use(compression());

if (process.env.NODE_ENV !== 'production') app.use(logger('dev'));

// Start Heroku mount.
app.get('/', (req, res) => res.send('Ok'));

// Public routes.
app.use('/auth', auth);
app.use('/watson', watson);

// Private routes.
app.use('/api', verifyJwt, awarewolf);
app.use('/user', verifyJwt, user);

app.listen(PORT, () => {
  if (process.env.NODE_ENV === 'development') console.log(`Running on ${PORT}`)
});

// MongoDB configuration.
mongoose.connect(DB_URI, { useNewUrlParser: true }, () => {
  if (process.env.NODE_ENV === 'development') console.log('Connected to MongoDB')
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
