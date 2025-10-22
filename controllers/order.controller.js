import Order from "../models/Order.js";
import OrderItem from "../models/order-item.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name");
    if (!orders) {
      return res
        .status(404)
        .json({ message: "No orders found", success: false });
    }
    res.status(200).json({ orders, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "food", populate: "category" },
      });
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found!", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderItemsResolved = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        const newOrder = new OrderItem({
          quantity: orderItem.quantity,
          food: orderItem.food,
        });
        newOrder.save();
        return newOrder._id;
      })
    );

    const totalPrice = await Promise.all(
      orderItemsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          "food",
          "price"
        );
        const total = orderItem.food.price * orderItem.quantity;
        return total;
      })
    );
    const orderTotal = totalPrice.reduce((a, b) => a + b, 0);

    let order = await Order.create({
      orderItems: orderItemsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: orderTotal,
      user: req.body.user,
    });
    res.status(201).json({ order, status: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
