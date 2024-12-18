import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { dbConnection } from './dbConnection/dbConnection.js';
import { Webhook } from 'svix';
import  User  from './models/User.model.js';
import { Password } from './models/Password.model.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://passwordmanager-mtph.onrender.com'],
  credentials: true
}));

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

  
  let evt;

  try {
    // Ensure the body is a Buffer and convert it to a string
    const payloadString = Buffer.isBuffer(req.body) 
      ? req.body.toString('utf8') 
      : JSON.stringify(req.body);
      
    
    evt = wh.verify(payloadString, svixHeaders);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({
      success: false,
      message: `Error verifying webhook: ${err.message}`,
    });
  }

  // Destructure event details
  const { id, type: eventType, data } = evt;

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

// Add password endpoint
app.post('/api/passwords', async (req, res) => {
  try {
    const { clerkId, Username, siteUrl, email, password } = req.body;

    console.log('Received password data:', { clerkId, email, siteUrl });

    // Verify if user exists
    const user = await User.findOne({ clerkId });
    if (!user) {
      console.log('User not found:', clerkId); // Debug log
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new password entry
    const newPassword = new Password({
      userId: clerkId,
      Username,
      siteUrl,
      email,
      password
    });

    await newPassword.save();
    console.log('Password saved successfully'); // Debug log

    res.status(201).json({
      success: true,
      message: 'Password saved successfully',
      data: newPassword
    });

  } catch (error) {
    console.error('Error saving password:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving password',
      error: error.message
    });
  }
});

// Get passwords for a specific user
app.get('/api/passwords/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    console.log('Fetching passwords for user:', clerkId); // Debug log

    const passwords = await Password.find({ userId: clerkId });
    console.log('Found passwords:', passwords.length); // Debug log

    res.status(200).json({
      success: true,
      data: passwords
    });

  } catch (error) {
    console.error('Error fetching passwords:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching passwords',
      error: error.message
    });
  }
});

// Delete a password
app.delete('/api/passwords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clerkId } = req.body; // For verification

    const password = await Password.findOne({ _id: id, userId: clerkId });
    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password not found or unauthorized'
      });
    }

    await Password.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Password deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting password:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting password',
      error: error.message
    });
  }
});

// Update a password
app.put('/api/passwords/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clerkId, Username, siteUrl, email, password } = req.body;

    const existingPassword = await Password.findOne({ _id: id, userId: clerkId });
    if (!existingPassword) {
      return res.status(404).json({
        success: false,
        message: 'Password not found or unauthorized'
      });
    }

    const updatedPassword = await Password.findByIdAndUpdate(
      id,
      {
        Username,
        siteUrl,
        email,
        password,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: updatedPassword
    });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
});


// Start server
app.listen(process.env.PORT, async () => {
  try {
    await dbConnection();

  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
});
