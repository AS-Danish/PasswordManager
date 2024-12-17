import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbConnection } from './dbConnection/dbConnection.js';
import bodyParser from 'body-parser';
import { Webhook } from 'svix';
import { User } from './models/User.js';

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

  // Handle different webhook events
  switch (eventType) {
    case 'user.created':
      await handleUserCreated(data);
      break;
    case 'user.updated':
      await handleUserUpdated(data);
      break;
    case 'user.deleted':
      await handleUserDeleted(data);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  // Respond to the webhook
  return res.status(200).json({
    success: true,
    message: 'Webhook received and processed successfully.',
  });
});

// Handler functions for different webhook events
async function handleUserCreated(data) {
  try {
    const newUser = new User({
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    });

    await newUser.save();
    console.log('User created in MongoDB:', newUser);
  } catch (error) {
    console.error('Error creating user in MongoDB:', error);
    throw error;
  }
}

async function handleUserUpdated(data) {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: data.id },
      {
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log('User not found in MongoDB, creating new user');
      await handleUserCreated(data);
      return;
    }

    console.log('User updated in MongoDB:', updatedUser);
  } catch (error) {
    console.error('Error updating user in MongoDB:', error);
    throw error;
  }
}

async function handleUserDeleted(data) {
  try {
    const deletedUser = await User.findOneAndDelete({ clerkId: data.id });
    if (deletedUser) {
      console.log('User deleted from MongoDB:', deletedUser);
    } else {
      console.log('User not found in MongoDB');
    }
  } catch (error) {
    console.error('Error deleting user from MongoDB:', error);
    throw error;
  }
}

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
