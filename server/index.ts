import express from 'express';
import cors from 'cors';
import { env } from '@/server/config/env';
import { connectDB } from '@/server/config/db';
import { logger } from '@/server/utils/logger';
import { errorHandler } from '@/server/middleware/error';
import routes from '@/server/routes';

const app = express();
const PORT = env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
});
