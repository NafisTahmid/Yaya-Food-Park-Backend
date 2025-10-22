import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({});

export const registerController = async (req, res) => {
  try {
    const { name, username, email, password, sex, phone, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
      sex: sex,
      phone: phone || "",
      address: address || "",
    });
    await newUser.save();
    return res
      .status(201)
      .json({ message: "Account created successfully :D", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "2d" });
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "Account doesn't exist", success: false });
    }
    const decryptedPassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!decryptedPassword) {
      return res
        .status(403)
        .json({ message: "Incorrect password", success: false });
    }
    const token = generateToken({
      id: existingUser.id,
      username: existingUser.username,
    });
    return res.status(200).json({
      message: `Welcome back ${existingUser.username}`,
      success: true,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const logoutController = async (_, res) => {
  try {
    return res
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "You're logged out!!!", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong!!!", success: false });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    if (!users) {
      return res.status(404).json("No users found");
    }
    res.status(200).json({ users, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res.status(200).json({ user, success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name, username, email, sex, phone, address } = req.body;
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    if (name) {
      foundUser.name = name;
    }
    if (username) {
      foundUser.username = username;
    }
    if (email) {
      foundUser.email = email;
    }
    if (sex) {
      foundUser.sex = sex;
    }
    if (phone) {
      foundUser.phone = phone;
    }
    if (address) {
      foundUser.address = address;
    }
    await foundUser.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const userId = req.id;
    const selectedUser = await User.findByIdAndDelete(userId);
    if (!selectedUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    res
      .status(200)
      .json({ message: "User deleted successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
