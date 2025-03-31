import 'dotenv/config';
import express from 'express';
import { apiRouter } from './routes/api/api.router';
import { connectDatabase, destroy } from './db/connect-database';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.SERVER_PORT ?? 4000;

app.use('/api', apiRouter);

process.on('beforeExit', async () => {
  await destroy();
  console.log('Database connection closed');
  process.exit(0)
});

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
}

startServer();
