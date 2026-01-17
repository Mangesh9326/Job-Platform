import express from "express";
import { signupUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/api/user/signup", signupUser);

export default router;