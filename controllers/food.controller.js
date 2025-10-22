import Food from "../models/food.model.js";
import User from "../models/user.model.js";
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";

export const addNewFood = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!name || !price || !category) {
      return res.status(403).json({
        message: "Name, price and category are required",
        success: false,
      });
    }
    if (!image) {
      return res
        .status(403)
        .json({ message: "Image is required", success: false });
    }
    if (!image.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Image upload type must be an image!",
        success: false,
      });
    }
    let optimizedBuffer;
    try {
      optimizedBuffer = await sharp(image.buffer)
        .resize({
          width: 800,
          height: 800,
          fit: "inside",
        })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
    let cloudResponse;
    try {
      cloudResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.log("Error uploading image to cloudinary ", error);
              return reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(optimizedBuffer);
      });
      const imageUrl = cloudResponse.secure_url;
      const newFood = await Food.create({
        author: authorId,
        name: name,
        price: price,
        category: category,
        image: imageUrl,
      });
      res
        .status(201)
        .json({ message: "New food created", newFood, success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const image = req.file;
    const newData = { name, price, category };

    if (image) {
      if (!image.mimetype.startsWith("image/")) {
        return res.status(400).json({
          message: "Image upload type must be an image!",
          success: false,
        });
      }

      const optimizedBuffer = await sharp(image.buffer)
        .resize({ width: 800, height: 800, fit: "inside" })
        .toFormat("jpeg", { quality: 80 })
        .toBuffer();

      const cloudResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(optimizedBuffer);
      });

      newData.image = cloudResponse.secure_url;
    }

    const updatedFood = await Food.findByIdAndUpdate(id, newData, {
      new: true,
      runValidators: true,
    });

    if (!updatedFood) {
      return res
        .status(404)
        .json({ message: "Food not found", success: false });
    }

    await updatedFood.populate({ path: "category", select: "name" });
    res.status(200).json({
      message: "Food updated successfully!",
      updatedFood,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const selectedFood = await Food.findByIdAndDelete(req.params.id);
    if (!selectedFood) {
      return res
        .status(404)
        .json({ message: "Food not found", success: false });
    }
    res.status(200).json({ message: "Food deleted!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
export const getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    if (!foods) {
      return res
        .status(404)
        .json({ message: "No foods found!", success: false });
    }
    res.status(200).json({ foods, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false`` });
  }
};

export const getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res
        .status(404)
        .json({ message: "Food not found!", success: false });
    }
    res.status(200).json({ food, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
