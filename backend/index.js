import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbConnection } from './dbConnection/dbConnection.js';
import router from './routes/user.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);


// Middleware to serve correct MIME types
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript');
  }
  next();
});


app.listen(process.env.PORT, async () => {
  try {
    await dbConnection();
    console.log(`Server Running on Port ${process.env.PORT}`);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
});