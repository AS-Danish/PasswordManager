import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbConnection } from './dbConnection/dbConnection.js';
import bodyParser from 'body-parser';
import { Webhook } from 'svix';

dotenv.config();

const app = express();

app.use(cors());

// Define webhook route first (with the changes above)
app.post('/webhook/clerk', express.raw({type: 'application/json', limit: '5mb'}), async (req, res) => {
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

  // Debug logging
  console.log('Received Headers:', svixHeaders);
  
  let evt;

  try {
    // Ensure the body is a Buffer and convert it to a string
    const payloadString = Buffer.isBuffer(req.body) 
      ? req.body.toString('utf8') 
      : JSON.stringify(req.body);
      
    console.log('Payload String:', payloadString); // Debug log
    
    evt = wh.verify(payloadString, svixHeaders);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    console.error('Error details:', {
      message: err.message,
      headers: svixHeaders,
      signingSecret: SIGNING_SECRET.substring(0, 4) + '...',
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body)
    });
    return res.status(400).json({
      success: false,
      message: `Error verifying webhook: ${err.message}`,
    });
  }

  // Destructure event details
  const { id, type: eventType, data } = evt;

  // Log webhook details
  console.log(`Webhook received - ID: ${id}, Event Type: ${eventType}`);
  console.log('Webhook Payload:', data);

  // Event-specific logic
  if (eventType === 'user.created') {
    console.log('New user created with ID:', data.id);
  }

  // Respond to the webhook
  return res.status(200).json({
    success: true,
    message: 'Webhook received successfully.',
  });
});

// Then add general middleware
app.use(express.json());

// Middleware to serve correct MIME types
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript');
  }
  next();
});

// Start server
app.listen(process.env.PORT, async () => {
  try {
    await dbConnection();
    console.log(`Server Running on Port ${process.env.PORT}`);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
});
