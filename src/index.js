if (process.env.NODE_ENV !== 'production') require('dotenv').config({ path: '../.env' });

import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import validator from 'express-validator';
import compression from 'compression';
import { auth, awarewolf, user } from './routes';
import bigQuery from './features/analytics/routes';
import clients from './features/clients/routes';
import { verifyJwt } from './utils';

const app = express();

const PORT = process.env.PORT || 3001;

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
app.use('/analytics', bigQuery);
app.use('/clients', clients);

// Private routes.
app.use('/api', verifyJwt, awarewolf);
app.use('/user', verifyJwt, user);

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') console.log(`Running on ${PORT}`);
});

// MongoDB configuration.
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }, () => {
  if (process.env.NODE_ENV !== 'production') console.log('Connected to MongoDB');
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
