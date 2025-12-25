import express from "express"
import isAuth from "../middleware/isAuth.js";
import {  acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, getTodayDelivery, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp, verifyPayment } from "../controllers/orderContorller.js";

 export const orderRouter = express.Router();

orderRouter.post("/place-order",isAuth, placeOrder)
orderRouter.post("/verify-payment",isAuth, verifyPayment)
orderRouter.post("/send-delivery-otp",isAuth, sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp",isAuth, verifyDeliveryOtp)
orderRouter.get("/my-orders",isAuth, getMyOrders)
orderRouter.post("/update-status/:orderId/:shopId",isAuth,updateOrderStatus)
orderRouter.get("/get-assignment",isAuth, getDeliveryBoyAssignment)
orderRouter.get("/accept-order/:assignmentId",isAuth,acceptOrder)
orderRouter.get("/get-current-order",isAuth,getCurrentOrder)
orderRouter.get("/get-order-by-id/:orderId",isAuth,getOrderById)
orderRouter.get("/get-today-deliveries/",isAuth,getTodayDelivery)