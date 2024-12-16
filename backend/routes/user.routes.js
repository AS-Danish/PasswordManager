import express from "express";
import {handleWebhook} from '../controller/user.controller.js'

const router = express.Router();

// Webhook route
router.post('/clerk', handleWebhook);

export default router;