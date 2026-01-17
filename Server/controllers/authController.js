import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ---------------------------------------
// SIGNUP
// ---------------------------------------
export const signup = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(400)
        .json({ message: "Email or Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      username,
      password: hashed,
    });

    await newUser.save();

    res.json({ message: "Signup successful!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------
// LOGIN
// ---------------------------------------
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validate
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // 4. Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,  // <-- Must exist!
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
