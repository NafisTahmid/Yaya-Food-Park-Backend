import Order from "../models/Order.js";
import OrderItem from "../models/order-item.js";
import User from "../models/user.model.js";
import axios from "axios";
import crypto from "crypto";
import qs from "qs";
import dotenv from "dotenv";
dotenv.config({});
function generateTransactionId() {
  return "SSL_" + crypto.randomBytes(10).toString("hex");
}

async function createSslCommerzPayment(amount, customer_info) {
  const store_id = process.env.SSLC_STORE_ID;
  const store_passwd = process.env.SSLC_STORE_PASSWORD;
  const sslcUrl = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"; // Sandbox URL for testing

  if (!store_id || !store_passwd) {
    throw new Error(
      "Store ID or Store Password is missing in the environment variables."
    );
  }

  const trxID = generateTransactionId();
  const payload = {
    store_id,
    store_passwd,
    total_amount: Number(amount.toFixed(2)),
    currency: "BDT",
    tran_id: trxID,
    success_url: `${process.env.BASE_URL}/api/v1/orders/sslcommerz/success?tran_id=${trxID}&currency=BDT&total_amount=${amount}`,
    fail_url: `${process.env.BASE_URL}/api/v1/orders/sslcommerz/fail?tran_id=${trxID}`,
    cancel_url: `${process.env.BASE_URL}/api/v1/orders/sslcommerz/cancel?tran_id=${trxID}`,
    cus_name: customer_info.name || "N/A",
    cus_email: customer_info.email || "default@beet.com",
    cus_phone: customer_info.phone || "N/A",
    cus_add1: customer_info.address || "N/A",
    cus_city: customer_info.address || "N/A",
    cus_country: customer_info.address || "N/A",
    shipping_method: "NO", // No shipping required for subscriptions
    product_name: "food",
    product_category: "food",
    product_profile: "physical-goods",
  };
  const response = await axios.post(sslcUrl, qs.stringify(payload), {
    headers: { Content_Type: "application/x-www-form-urlencoded" },
  });

  if (response.data.status !== "SUCCESS") {
    throw new Error(
      response.data.failedreason || "SSL Commerz payment initialization failed"
    );
  }
  return {
    gatewayPageURL: response.data.GatewayPageURL,
    transaction_id: trxID,
  };
}
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
  const userId = req.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found!", success: false });
  }

  try {
    // Step 1: Create OrderItems and resolve their IDs
    const orderItemsResolved = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        const newOrder = new OrderItem({
          quantity: orderItem.quantity,
          food: orderItem.food,
        });

        const savedOrderItem = await newOrder.save();
        return savedOrderItem._id;
      })
    );

    const totalPrice = await Promise.all(
      orderItemsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId)
          .populate("food", "price")
          .exec();

        if (!orderItem.food) {
          throw new Error(`Food not found for OrderItem ID: ${orderItemId}`);
        }

        const total = orderItem.food.price * orderItem.quantity;
        return total;
      })
    );
    const orderTotal = totalPrice.reduce((a, b) => a + b, 0);

    // Step 4: Create the main Order with resolved OrderItem references and other details

    const order = await Order.create({
      orderItems: orderItemsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status || "pending",
      totalPrice: orderTotal,
      user: req.body.user,
    });
    const sslCommerzResponse = await createSslCommerzPayment(orderTotal, user);
    order.transaction_id = sslCommerzResponse.transaction_id;
    await order.save();
    const paymentData = {
      payment_session_id: sslCommerzResponse.transaction_id,
      payment_gateway_url: sslCommerzResponse.gatewayPageURL,
    };

    res.status(201).json({
      message: "Order created successfully :D",
      paymentData,
      status: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.params.status,
      },
      { new: true }
    );
    if (!updatedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found!", success: false });
    }
    res.status(200).json({ message: "Order status updated", success: true });
  } catch (error) {
    return res.status(404).json({ message: error.message, success: false });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    let deletedOrder = await Order.findById(req.params.id);
    if (!deletedOrder) {
      return res
        .status(404)
        .json({ message: "Order not found!", success: false });
    }
    await OrderItem.deleteMany({ _id: { $in: deletedOrder.orderItems } });
    deletedOrder = await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted!", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.params.userId })
      .populate({
        path: "orderItems",
        populate: { path: "food", populate: "category" },
      })
      .sort({ dateOrdered: -1 });
    if (!userOrders) {
      return res
        .status(404)
        .json({ message: "Order not found!", success: false });
    }
    res.status(200).json({ userOrders, success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const sslSuccess = async (req, res) => {
  try {
    const { tran_id } = req.query;
    const foundOrder = await Order.findOne({ transaction_id: tran_id });
    if (!foundOrder) {
      return res
        .status(404)
        .json({ message: "Order not found!", success: false });
    }
    foundOrder.status = "success";
    await foundOrder.save();
    console.log("Order successful :D");
    res.status(200).json({ message: "Payment successful", success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
