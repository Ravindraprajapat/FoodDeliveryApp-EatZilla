import express from "express"
import { createEditShop, getShopByCity, getShopByOwner } from "../controllers/shopController.js";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";

 export const shopRouter = express.Router();

shopRouter.post("/create-edit",isAuth,upload.single("image"), createEditShop)
shopRouter.get("/get-my",isAuth,getShopByOwner)
shopRouter.get("/get-by-city/:city",isAuth,getShopByCity)


