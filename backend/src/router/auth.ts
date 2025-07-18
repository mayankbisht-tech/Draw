import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../model/user";
import { registerSchema, loginSchema } from "../validation/authSchema";

const router = express.Router();

router.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const { firstname, lastname, email, password } = result.data;

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await user.save();

    const jwtSecret = process.env.SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured in environment" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Some error occurred" });
  }
});

router.post("/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const { email, password } = result.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No user with this email found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Password incorrect" });
    }

    const jwtSecret = process.env.SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT secret not configured in environment" });
    }

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
