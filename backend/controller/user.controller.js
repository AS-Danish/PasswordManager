import User from '../models/User.model.js';
import { Webhook } from 'svix';

async function handleWebhook(req, res) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.error('Missing SIGNING_SECRET in environment variables.');
    return res.status(400).json({
      success: false,
      message: 'Error: Please add SIGNING_SECRET to .env',
    });
  }

  const wh = new Webhook(SIGNING_SECRET);
  const headers = req.headers;
  const payload = req.body.toString(); // Ensure buffer is converted to string

  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing required Svix headers.');
    return res.status(400).json({
      success: false,
      message: 'Error: Missing svix headers',
    });
  }

  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
    console.log('Webhook verified successfully:', evt);
  } catch (err) {
    console.error('Error verifying webhook:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created': {
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
        const updatedUser = await User.findOneAndUpdate(
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
        console.log(`User updated: ${updatedUser.username}`);
        break;
      }

      case 'user.deleted': {
        await User.deleteOne({ clerkId: id });
        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received and processed successfully',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing the webhook event',
    });
  }
}

export { handleWebhook };
