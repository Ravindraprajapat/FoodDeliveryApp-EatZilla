import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shopModel.js";

/* ================= CREATE / EDIT SHOP ================= */
export const createEditShop = async (req, res) => {
  try {
    const userId = req.user._id;

    const { name, city, state, address, existingImage } = req.body;

    let imageUrl;

    if (req.file) {
      imageUrl = await uploadOnCloudinary(req.file.path);
    }

    if (!imageUrl && existingImage) {
      imageUrl = existingImage;
    }

    let shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        owner: userId,
        image: imageUrl,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          city,
          state,
          address,
          image: imageUrl || shop.image,
        },
        { new: true }
      );
    }

    // ✅ FIX HERE
    await shop.populate([
      { path: "owner" },
      { path: "items" },
    ]);

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({
      message: "Error in creating shop",
      error: error.message,
    });
  }
};


/* ================= GET SHOP BY OWNER ================= */
export const getShopByOwner = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id }) // ✅ FIX
      .populate("owner")
      .populate({
        path: "items",
        options: { sort: { updatedAt: -1 } },
      });

    return res.status(200).json(shop || null);
  } catch (error) {
    return res.status(500).json({
      message: "Error in getting shop",
      error: error.message,
    });
  }
};

/* ================= GET SHOP BY CITY ================= */
export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;

    if (!city || city === "null") {
      return res.status(400).json({ message: "City is required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") },
    }).populate("items");

    if (!shops.length) {
      return res.status(404).json({ message: "Shops not found" });
    }

    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({
      message: "Get shop by city error",
      error: error.message,
    });
  }
};







// import uploadOnCloudinary from '../utils/cloudinary.js'
// import Shop from '../models/shopModel.js'

// export const createEditShop = async (req, res) => {
//   try {
//     const userId = req.userId;   // ✅ FIX (must come from isAuth middleware)

//     const { name, city, state, address } = req.body;

//     let imageUrl;

//     // Upload image if available
//     if (req.file) {
//       const uploaded = await uploadOnCloudinary(req.file.path);
//       imageUrl = uploaded?.secure_url;
//     }

//     // Check if shop already exists
//     let shop = await Shop.findOne({ owner: userId });

//     // If shop does NOT exist → CREATE new shop
//     if (!shop) {
//       shop = await Shop.create({
//         name,
//         city,
//         state,
//         address,
//         owner: userId,
//         image: imageUrl,
//       });
//     }
//     else {
//       // If shop EXISTS → UPDATE current shop
//       shop = await Shop.findByIdAndUpdate(
//         shop._id,
//         {
//           name,
//           city,
//           state,
//           address,
//           image: imageUrl || shop.image,   // ← keep old image if new not uploaded
//         },
//         { new: true }
//       );
//     }

//     await shop.populate("owner");

//     return res.status(201).json(shop);

//   } catch (error) {
//     return res.status(500).json({
//       message: "Error in creating shop",
//       error: error.message,
//     });
//   }
// };


// import uploadOnCloudinary from '../utils/cloudinary.js'
// import Shop from '../models/shopModel.js'
// import { escape } from 'querystring'
// export const createEditShop = async (req, res) => {
//   try {
//     const { name, city, state, address } = req.body
//     let image
//     if (req.file) {
//       image = await uploadOnCloudinary(req.file.path)
//     }

//   let shop = await Shop.findOne({owner:userId});
//   if(!shop){
//     shop = await Shop.create({
//       name,
//       city,
//       state,
//       address,
//       owner: req.userId
//     })
//   }
//   else{
//       shop = await Shop.findByIdAndUpdate(shop._id , {
//       name,
//       city,
//       state,
//       address,
//       owner: req.userId
//     },{new : true})
//   }

//     await Shop.populate('owner')
//     return res.status(201).json(shop)
//   } catch (error) {
//     return res.status(500).json({ message: 'Error in creating shop', error: error.message })
//   }
// }

// export const getShopByOwner = async (req, res) => {
//   try {
//     const shop = await Shop.findOne({owner:req.userId}).populate("owner items")
//     if(!shop){
//       return null
//     }
//     else{
//       return res.status(200).json(shop)
//     }
//   }
//   catch (error) {
//     return res.status(500).json({ message: 'Error in getting shop', error: error.message })
//   }
// }