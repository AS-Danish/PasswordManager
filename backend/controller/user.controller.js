import User from '../models/User.model.js'
import { Webhook } from 'svix';

// Handle incoming webhook from Svix
async function handleWebhook(req, res) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    return res.status(400).json({
      success: false,
      message: 'Error: Please add SIGNING_SECRET from Clerk Dashboard to .env',
    });
  }

  // Create Svix Webhook instance with your secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers and body
  const headers = req.headers;
  const payload = req.body;

  // Get Svix headers for verification
  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  // If any required headers are missing, return an error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({
      success: false,
      message: 'Error: Missing svix headers',
    });
  }

  let evt;

  // Attempt to verify the incoming webhook
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.log('Error: Could not verify webhook:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle the event based on its type
  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created': {
        // Handle user created event
        const newUser = new User({
          clerkId: id,
          email: evt.data.email_addresses[0]?.email_address || '',
          username: evt.data.username || '',
          firstName: evt.data.first_name || '',
          lastName: evt.data.last_name || '',
          profileAvatar: evt.data.profile_image_url || '',
          createdAt: new Date(evt.data.created_at || Date.now()),
        });
        await newUser.save();
        console.log(`User created: ${newUser.username}`);
        break;
      }

      case 'user.updated': {
        // Handle user updated event
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            email: evt.data.email_addresses[0]?.email_address || '',
            username: evt.data.username || '',
            firstName: evt.data.first_name || '',
            lastName: evt.data.last_name || '',
            profileAvatar: evt.data.profile_image_url || '',
            updatedAt: new Date(evt.data.updated_at || Date.now()),
          },
          { new: true }
        );
        console.log(`User updated: ${id}`);
        break;
      }

      case 'user.deleted': {
        // Handle user deleted event
        await User.deleteOne({ clerkId: id });
        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received and processed',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing the webhook event',
    });
  }
}

export {handleWebhook};