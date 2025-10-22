import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  orderItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress1: {
    type: String,
    required: true,
  },
  shippingAddress2: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "failed", "successful"],
    default: "pending",
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  dateOrdered: {
    type: Date,
    default: Date.now(),
  },
});

orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
orderSchema.get("toJSON", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
