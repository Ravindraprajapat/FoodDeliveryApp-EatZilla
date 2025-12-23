import express from "express"
import { addItem, deleteItem, editItem, getItemByCity, getItemById } from "../controllers/itemController.js";
import { upload } from "../middleware/multer.js";
import isAuth from "../middleware/isAuth.js";


 export const itemRouter = express.Router();

itemRouter.post("/add-item" , isAuth,upload.single("image"), addItem)
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"), editItem)
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.get("/delete/:itemId",isAuth,deleteItem)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)

