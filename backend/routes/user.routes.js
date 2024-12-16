import express from "express";
import { getUsers } from "../controller/user.controller.js";

const router = express.Router();

router.post('/clerkUsers', getUsers)

export default router;