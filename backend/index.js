import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbConnection } from './dbConnection/dbConnection.js';
import bodyParser from 'body-parser';
import { Webhook } from 'svix';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
// Use user routes

// Middleware to parse raw body as needed by svix for signature verification
app.use(
  '/webhook/clerk',
  bodyParser.raw({ type: 'application/json' }) // Ensure raw body is used for webhook verification
);

// Webhook handler
app.post('/webhook/clerk', async (req, res) => {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.error('Error: SIGNING_SECRET not found in environment variables.');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: SIGNING_SECRET is missing.',
    });
  }

  const wh = new Webhook(SIGNING_SECRET);

  // Get Svix headers for verification
  const svixHeaders = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };

  // Check if necessary headers are present
  if (!svixHeaders['svix-id'] || !svixHeaders['svix-timestamp'] || !svixHeaders['svix-signature']) {
    console.error('Error: Missing required Svix headers.');
    return res.status(400).json({
      success: false,
      message: 'Error: Missing required Svix headers.',
    });
  }

  let evt;

  try {
    // Verify the incoming webhook
    evt = wh.verify(req.body, svixHeaders);
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({
      success: false,
      message: `Error verifying webhook: ${err.message}`,
    });
  }

  // Log webhook details
  const { id, type: eventType, data } = evt;
  console.log(`Webhook received - ID: ${id}, Event Type: ${eventType}`);
  console.log('Webhook Payload:', data);

  // Respond to the webhook
  return res.status(200).json({
    success: true,
    message: 'Webhook received successfully.',
  });
});

if (eventType === 'user.created') {
  console.log('userId:', evt.data.id)
}


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