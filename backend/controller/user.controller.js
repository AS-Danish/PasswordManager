import User from '../models/User.model.js'
import crypto from 'crypto';

// Your Clerk Webhook Secret
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Webhook handler
const handleWebhook = async (req, res) => {
  const payload = JSON.stringify(req.body); // Raw payload
  const signature = req.headers['clerk-signature']; // Signature from Clerk

  // Verify the payload
  const hmac = crypto.createHmac('sha256', CLERK_WEBHOOK_SECRET).update(payload).digest('hex');

  if (hmac !== signature) {
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook event
  const event = req.body;

  try {
    switch (event.type) {
      case 'user.created': {
        const newUser = new User({
          clerkId: event.data.id,
          email: event.data.email_addresses[0]?.email_address || '',
          username: event.data.username || '',
          firstName: event.data.first_name || '',
          lastName: event.data.last_name || '',
          profileAvatar: event.data.profile_image_url || '',
          createdAt: new Date(event.data.created_at || Date.now()),
        });
        await newUser.save();
        break;
      }

      case 'user.updated': {
        await User.findOneAndUpdate(
          { clerkId: event.data.id },
          {
            email: event.data.email_addresses[0]?.email_address || '',
            username: event.data.username || '',
            firstName: event.data.first_name || '',
            lastName: event.data.last_name || '',
            profileAvatar: event.data.profile_image_url || '',
            updatedAt: new Date(event.data.updated_at || Date.now()),
          },
          { new: true }
        );
        break;
      }

      case 'user.deleted': {
        await User.deleteOne({ clerkId: event.data.id });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { handleWebhook };