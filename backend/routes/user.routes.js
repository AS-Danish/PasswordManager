import express from "express";
import {handleWebhook} from '../controller/user.controller.js'
import bodyParser from "body-parser";

const router = express.Router();

// Webhook route
router.use(bodyParser.raw({type: 'application/json'}));
router.post('/clerk', handleWebhook);

export default router;