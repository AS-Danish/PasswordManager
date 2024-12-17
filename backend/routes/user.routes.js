import express from "express";
import {handleWebhook} from '../controller/user.controller.js'
import bodyParser from "body-parser";

const router = express.Router();

// Middleware to parse the raw body content for webhooks
router.use(bodyParser.raw({ type: 'application/json' }));

// Route to handle webhooks
router.post('/clerk', handleWebhook);

export default router;