import express from "express"
import isAuth from "../middleware/isAuth.js";
import {  acceptOrder, getDeliveryBoyAssignment, getMyOrders, placeOrder, updateOrderStatus } from "../controllers/orderContorller.js";

 export const orderRouter = express.Router();

orderRouter.post("/place-order",isAuth, placeOrder)
orderRouter.get("/my-orders",isAuth, getMyOrders)
orderRouter.post("/update-status/:orderId/:shopId",isAuth,updateOrderStatus)
orderRouter.get("/get-assignment",isAuth, getDeliveryBoyAssignment)
orderRouter.get("/accept-order/:assignmentId",isAuth,acceptOrder)

