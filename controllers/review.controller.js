import Review from "../models/review.model.js";
import User from "../models/user.model.js";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    if (!reviews) {
      return res
        .status(404)
        .json({ message: "No reviews found", success: false });
    }
    res.status(200).json({ reviews, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res
        .status(404)
        .json({ message: "Review not found", success: false });
    }
    res.status(200).json({ review, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const createReview = async (req, res) => {
  try {
    const userId = req.id;
    const { comment } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!!!", success: false });
    }
    const newReview = new Review({
      comment: comment,
      author: userId,
    });
    await newReview.save();
    res
      .status(201)
      .json({ message: "New review created successfully :D", success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const updateReview = async (req, res) => {
  try {
    const userId = req.id;
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        comment: req.body.comment,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({ message: "Review updated", success: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const selectedReview = await Review.findByIdAndDelete(req.params.id);
    if (!selectedReview) {
      return res
        .status(404)
        .json({ message: "Review not found", success: false });
    }
    res
      .status(200)
      .json({ message: "Review deleted successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
