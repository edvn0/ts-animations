import 'dotenv/config';
import express from 'express';
import { apiRouter } from './routes/api/api.router';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.SERVER_PORT ?? 4000;

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});