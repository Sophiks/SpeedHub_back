import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { connectMongoDB } from './config/db.js';

import questionsRoutes from './routes/questions.js';
import usersRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(cookieParser());

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectMongoDB();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Забагато запитів з цього IP, спробуйте пізніше.' },
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:3000',
  'https://speedhub-neon.vercel.app',
  'https://speedhub-6fam.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*',
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SpeedHub API',
      version: '1.0.0',
      description: 'API для SpeedHub',
    },
    servers: [{ url: 'https://speedhub-6fam.onrender.com' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(
  '/images',
  express.static(path.join(process.cwd(), 'src/public/images/testsImg')),
);

app.use('/api/questions', questionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
