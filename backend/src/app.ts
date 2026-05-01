import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/error.middleware';
import routes from './routes/index';
import { clerkMiddleware } from "@clerk/express";

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(clerkMiddleware());
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
