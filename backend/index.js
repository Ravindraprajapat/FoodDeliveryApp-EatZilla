import express  from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoute.js";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import { shopRouter } from "./routes/shopRoutes.js";
import { itemRouter } from "./routes/itemRoutes.js";
import { orderRouter } from "./routes/orderRoutes.js";

const app = express() // yaha pe Express ka instance banaya hai express ki sari chije hme app  me milengi
const port = process.env.PORT || 5000;
app.use(cors({
    origin: "http://localhost:5173",
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/shop",shopRouter)
app.use("/api/item",itemRouter)
app.use("/api/order",orderRouter)

// 


app.listen(port , ()=>{
    connectDB();
    console.log(`server is started at ${port}`)
})
