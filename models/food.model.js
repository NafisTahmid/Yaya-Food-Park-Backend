import mongoose from "mongoose";

const foodSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);
foodSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
foodSchema.set("toJSON", { virtuals: true });

const Food = mongoose.model("Food", foodSchema);
export default Food;
