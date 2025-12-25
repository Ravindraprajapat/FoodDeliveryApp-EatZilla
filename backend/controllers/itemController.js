import Item from '../models/itemsModel.js'
import Shop from '../models/shopModel.js'
import uploadOnCloudinary from '../utils/cloudinary.js'

/* ================= ADD ITEM ================= */
export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body
    let image

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path)
    }

    // 🔥 FIX: req.user._id use karo
    const shop = await Shop.findOne({ owner: req.user._id })
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    const item = await Item.create({
      name,
      image,
      category,
      foodType,
      price,
      shop: shop._id
    })

    shop.items.push(item._id)
    await shop.save()

    await shop.populate([
      { path: 'owner' },
      { path: 'items', options: { sort: { updatedAt: -1 } } }
    ])

    return res.status(201).json(shop)
  } catch (error) {
    return res.status(500).json({ message: 'Error in adding item' })
  }
}

/* ================= EDIT ITEM ================= */
export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const { name, category, foodType, price } = req.body
    let image

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path)
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      { name, image, category, foodType, price },
      { new: true }
    )

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    const shop = await Shop.findOne({ owner: req.user._id }).populate({
      path: 'items',
      options: { sort: { updatedAt: -1 } }
    })

    return res.status(200).json(shop)
  } catch (error) {
    return res.status(500).json({ message: 'Error in editing item' })
  }
}

/* ================= GET ITEM BY ID ================= */
export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const item = await Item.findById(itemId)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    return res.status(200).json(item)
  } catch (error) {
    return res.status(500).json({ message: `Error in fetching item ${error}` })
  }
}

/* ================= DELETE ITEM ================= */
export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId

    const item = await Item.findById(itemId)
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    const shop = await Shop.findOne({ owner: req.user._id })
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    shop.items = shop.items.filter(i => i.toString() !== item._id.toString())

    await shop.save()

    await shop.populate({
      path: 'items',
      options: { sort: { updatedAt: -1 } }
    })

    return res.status(200).json(shop)
  } catch (error) {
    return res.status(500).json({ message: 'Error in deleting item' })
  }
}

/* ================= GET ITEM BY CITY ================= */
export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params

    if (!city || city === 'null') {
      return res.status(400).json({ message: 'City is required' })
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(city.trim(), 'i') }
    })

    if (shops.length === 0) {
      return res.status(404).json({ message: 'No shops found in this city' })
    }

    const shopIds = shops.map(shop => shop._id)

    const items = await Item.find({ shop: { $in: shopIds } })

    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found in these shops' })
    }

    return res.status(200).json(items)
  } catch (error) {
    return res.status(500).json({ message: 'Error in getting items by city' })
  }
}

/* ================= GET ITEM BY SHOP ================= */
export const getItemByShop = async (req, res) => {
  try {
    const { shopId } = req.params

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' })
    }

    const shop = await Shop.findById(shopId).populate('items')

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' })
    }

    return res.status(200).json({
      shop,
      items: shop.items
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error in getting items by shop',
      error: error.message
    })
  }
}

export const searchItem = async (req, res) => {
  try {
    const { query, city } = req.query
    if (!query || !city) {
      return null
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(city, 'i') }
    }).populate('items')

    if (!shops.length) {
      return res.status(404).json({ message: 'Shops not found' })
    }
    const shopIds = shops.map(s=>s._id)
    const items = await Item.find({
      shop: { $in: shopIds },
      $or:[
        {name:{$regex:query,$options:"i"}},
        {category:{$regex:query,$options:"i"}}
      ]
    }).populate("shop","name image")
    return res.status(200).json(items)

  } catch (error) {
    return res.status(500).json({
      message: 'Error in searching items',
      error: error.message
    })
  }
}


export const rating = async (req,res) =>{
  try {
    const {itemId , rating} = req.body;
    if(!itemId || !rating){
      return res.status(400).json({message : "itemId and rating is required"})
    }
    if(rating < 1 || rating > 5){
      return res.status(400).json({message : "rating must be between 1 and 5"})
    }

    const item = await Item.findById(itemId)
    if(!item){
      return res.status(404).json({message : "Item not found"})
    }

    const newCount = item.rating.count+1
    const newAverage = ((item.rating.average * item.rating.count) + rating) / newCount
    item.rating.count = newCount
    item.rating.average = newAverage
    await item.save()
    return res.status(200).json({rating:item.rating})

  } catch (error) {
    return res.status(500).json({message : `Error in rating item ${error}`})  
  }
}



// import Item from '../models/itemsModel.js'
// import Shop from '../models/shopModel.js'
// import uploadOnCloudinary from '../utils/cloudinary.js'

// export const addItem = async (req, res) => {
//   try {
//     const { name, category, foodType, price } = req.body
//     let image
//     if (req.file) {
//       image = await uploadOnCloudinary(req.file.path)
//     }

//     const shop = await Shop.findOne({ owner: req.userId })
//     if (!shop) {
//       return res.status(404).json({ message: 'Shop not found' })
//     }
//     const item = await Item.create({
//       name,
//       image,
//       category,
//       foodType,
//       price,
//       shop: shop._id
//     })
//     shop.items.push(item._id)
//     await shop.save()
//       await shop.populate('owner')
//       await shop.populate({
//         path: 'items',
//         options: { sort: { updatedAt: -1 } }
//       })
//     return res.status(201).json(shop)
//   } catch (error) {
//     return res.status(500).json({ message: 'Error in adding item' })
//   }
// }

// export const editItem = async (req, res) => {
//   try {
//     const itemId = req.params.itemId
//     const { name, category, foodType, price } = req.body
//     let image
//     if (req.file) {
//       image = await uploadOnCloudinary(req.file.path)
//     }

//     const item = await Item.findByIdAndUpdate(
//       itemId,
//       {
//         name,
//         image,
//         category,
//         foodType,
//         price
//       },
//       { new: true }
//     )

//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' })
//     }
//     const shop = await Shop.findOne({ owner: req.userId }).populate({
//       path: 'items',
//       options: { sort: { updatedAt: -1 } }
//     })
//     return res.status(200).json(shop)
//   } catch (error) {
//     return res.status(500).json({ message: 'Error in editing item' })
//   }
// }

// export const getItemById = async (req, res) => {
//   try {
//     const itemId = req.params.itemId
//     const item = await Item.findById(itemId)
//     if (!item) {
//       return res.status(404).json({ message: 'Item not found' })
//     }
//     return res.status(200).json(item)
//   } catch (error) {
//     return res.status(500).json({ message: `Error in fetching item ${error}` })
//   }
// }

// export const deleteItem = async (req, res) => {
//   try {
//     const itemId = req.params.itemId;

//     // Check item exists
//     const item = await Item.findById(itemId);
//     if (!item) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     // Find the shop of this owner
//     const shop = await Shop.findOne({ owner: req.userId });
//     if (!shop) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     // FIXED: Correct filter syntax
//     shop.items = shop.items.filter(
//       (i) => i.toString() !== item._id.toString()
//     );

//     await shop.save();

//     // FIXED: Await populate
//     await shop.populate({
//       path: "items",
//       options: { sort: { updatedAt: -1 } },
//     });

//     return res.status(200).json(shop);

//   } catch (error) {
//     console.error("Delete error:", error);
//     return res.status(500).json({ message: "Error in deleting item" });
//   }
// };

// export const getItemByCity = async (req, res) => {
//   try {
//     const { city } = req.params;

//     if (!city) {
//       return res.status(400).json({ message: "City is required" });
//     }

//     // 1. Pehle us city ki saari shops dhundo
//     const shops = await Shop.find({
//       city: { $regex: new RegExp(city.trim(), "i") }
//     });

//     // 2. CHECK: Agar shops array khali hai (.length === 0)
//     if (!shops || shops.length === 0) {
//       return res.status(404).json({ message: "No shops found in this city" });
//     }

//     // 3. Shop IDs nikaalein
//     const shopIds = shops.map((shop) => shop._id);

//     // 4. In shops ke saare items dhundo
//     // Note: 'shop' field ka naam wahi rakhein jo aapke Item Schema mein hai
//     const items = await Item.find({ shop: { $in: shopIds } });
//       console.log(items)
//     if (!items || items.length === 0) {
//       return res.status(404).json({ message: "No items found in these shops" });
//     }

//     return res.status(200).json(items);

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error in getting items by city" });
//   }
// };

// export const deleteItem = async(req,res) =>{
// try{
//   const itemId = req.params.itemId;
//   const item = await Item.findById(itemId)
//   if(!item){
//     return res.status(404).json({ message: 'Item not found' })
//   }
//   const shop = await Shop.findOne({owner : req.userId})
//    shop.items = shop.items.filter((i)=i.toString()!==item._id.toString())
//     await shop.save()
//     shop.populate({
//       path:"items",
//       options:{sort:{updatedAt:-1}}

//     })
//     return res.status(200).json(shop)

// }
// catch(error){
//   return res.status(500).json({ message: 'Error in deleting item' })
// }
// }
