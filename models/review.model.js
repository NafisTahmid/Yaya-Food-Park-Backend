import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
reviewSchema.set("toJSON", { virtuals: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
