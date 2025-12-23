import DeliveryAssignment from '../models/deliveryAssignmentModel.js'
import Order from '../models/orderModel.js'
import Shop from '../models/shopModel.js'
import User from '../models/userModel.js'

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: 'Delivery address is required' })
    }

    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User not logged in' })
    }

    const groupItemsByShop = {}

    cartItems.forEach(item => {
      const shopId = item.shop
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = []
      }
      groupItemsByShop[shopId].push(item)
    })

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async shopId => {
        const shop = await Shop.findById(shopId).populate('owner')
        if (!shop) {
          throw new Error(`Shop with id ${shopId} not found`)
        }

        const items = groupItemsByShop[shopId]

        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        )

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map(i => ({
            item: i._id,
            price: i.price,
            quantity: i.quantity,
            name: i.name
          }))
        }
      })
    )

    const newOrder = await Order.create({
      user: req.user._id,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders
    })

    await newOrder.populate(
      'shopOrders.shopOrderItems.item',
      'name image price'
    )
    await newOrder.populate('shopOrders.shop', 'name')
    return res.status(201).json(newOrder)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ message: `Place order error: ${error.message}` })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (user.role == 'user') {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate('shopOrders.shop', 'name')
        .populate('shopOrders.owner', 'name email mobile')
        .populate('shopOrders.shopOrderItems.item', 'name image price')
      return res.status(200).json(orders)
    } else if (user.role == 'owner') {
      const orders = await Order.find({ 'shopOrders.owner': req.userId })
        .sort({ createdAt: -1 })
        .populate('shopOrders.shop', 'name')
        .populate('user')
        .populate('shopOrders.shopOrderItems.item', 'name image price')

      const filterOrders = orders.map(order => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find(
          o => o.owner.toString() === req.userId.toString()
        ),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress
      }))

      return res.status(200).json(filterOrders)
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Get user orders error: ${error.message}` })
  }
}


export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params
    const { status } = req.body

    // 🔹 Order fetch
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // 🔹 ShopOrder find (ObjectId safe compare)
    const shopOrder = order.shopOrders.find(
      o => o.shop && o.shop.toString() === shopId.toString()
    )

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" })
    }

    // 🔹 Update status
    shopOrder.status = status
    let deliveryBoysPayload = []

    /* ================= OUT FOR DELIVERY ================= */
    if (status === "out for delivery" && !shopOrder.assignment) {

      // 🔸 Delivery address validation (MOST IMPORTANT)
      if (
        !order.deliveryAddress ||
        order.deliveryAddress.latitude == null ||
        order.deliveryAddress.longitude == null
      ) {
        return res.status(400).json({
          message: "Delivery location missing for this order"
        })
      }

      const { latitude, longitude } = order.deliveryAddress

      // 🔸 Fetch delivery boys having location
      const deliveryBoys = await User.find({
        role: "deliveryBoy",
        location: { $exists: true }
      })

      // 🔸 Only boys with valid coordinates
      const validDeliveryBoys = deliveryBoys.filter(
        b => Array.isArray(b.location?.coordinates) &&
             b.location.coordinates.length === 2
      )

      if (validDeliveryBoys.length === 0) {
        await order.save()
        return res.status(200).json({
          message: "Order status updated but no delivery boy has location"
        })
      }

      // 🔸 Find busy delivery boys
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: validDeliveryBoys.map(b => b._id) },
        status: { $nin: ["brodcasted", "completed"] }
      }).distinct("assignedTo")

      const busySet = new Set(busyIds.map(id => id.toString()))

      // 🔸 Available delivery boys
      const availableBoys = validDeliveryBoys.filter(
        b => !busySet.has(b._id.toString())
      )

      if (availableBoys.length === 0) {
        await order.save()
        return res.status(200).json({
          message: "Order status updated but no delivery boy available"
        })
      }

      // 🔸 Create delivery assignment
      const assignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: availableBoys.map(b => b._id),
        status: "brodcasted"
      })

      shopOrder.assignment = assignment._id

      // 🔸 Payload for frontend (SAFE)
      deliveryBoysPayload = availableBoys.map(b => ({
        id: b._id,
        fullName: b.fullName,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
        mobile: b.mobile
      }))
    }

    // 🔹 Save order
    await order.save()


     const updatedShopOrder = order.shopOrders.find(
      o => o.shop && o.shop.toString() === shopId.toString()
    )
    // 🔹 Populate (correct paths)
    await order.populate("shopOrders.shop", "name")
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile"
    )

   

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment || null
    })

  } catch (error) {
    console.error("Update order status error:", error)
    return res.status(500).json({
      message: `Order status error: ${error.message}`
    })
  }
}


export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId

    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: 'brodcasted',
    })
      .populate("order")
      .populate("shop")

    const formatted = assignments.map(a => {
      const shopOrder = a.order?.shopOrders.find(
        so => so._id.equals(a.shopOrderId)
      )

      return {
        assignmentId: a._id,
        orderId: a.order?._id,
        shopName: a.shop?.name,
        deliveryAddress: a.order?.deliveryAddress,
        items: shopOrder?.shopOrderItems || [],
        subtotal: shopOrder?.subtotal || 0,
      }
    })

    return res.status(200).json(formatted)
  } catch (error) {
    return res.status(500).json({
      message: `get assignment error: ${error.message}`
    })
  }
}

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params

    const assignment = await DeliveryAssignment.findById(assignmentId)
    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" })
    }

    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "Assignment expired" })
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $in: ["assigned", "picked", "on_the_way"] }
    })

    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You already have an active assignment" })
    }

    assignment.assignedTo = req.userId
    assignment.status = "assigned"
    assignment.assignedAt = new Date()
    await assignment.save()

    const order = await Order.findById(assignment.order)
    if (!order) {
      return res.status(400).json({ message: "Order not found" })
    }

    const shopOrder = order.shopOrders.find(
      so => so._id.equals(assignment.shopOrderId)
    )

    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" })
    }

    shopOrder.assignedDeliveryBoy = req.userId
    await order.save()

    return res.status(200).json({ message: "Order accepted successfully" })

  } catch (error) {
    return res.status(500).json({
      message: `Accept order error: ${error.message}`
    })
  }
}







// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId, shopId } = req.params
//     const { status } = req.body
//     const order = await Order.findById(orderId)
//     const shopOrder = order.shopOrders.find(o => o.shop == shopId)
//     if (!shopOrder) {
//       return res.status(404).json({ message: 'Shop order not found' })
//     }
//     shopOrder.status = status
//     let deliveryBoysPayload=[]
//     if (status == 'out for delivery' || !shopOrder.assignment) {
//       const { longitude, latitude } = order.deliveryAddress
//       const nearByDelivery = await User.find({
//         role: 'deliveryBoy',
//         location: {
//           $near: {
//             $geometry: {
//               type: 'Point',
//               coordinates: [Number(longitude), Number(latitude)]
//             },
//             $maxDistance: 5000
//           }
//         }
//       })
//       const nearByIds=nearByDelivery.map(b=>b._id)
//       const busyIds=await DeliveryAssignment.find({
//         assignedTo:{$in:nearByIds},
//         status:{$nin:['brodcasted','completed']}
//       }).distinct("assignedTo")

//       const busyIdSet = new Set(busyIds.map(id=>String(id)));
//       const availableBoys = nearByIds.filter(b=>!busyIdSet.has(String(b._id)))
//       const candidates=availableBoys.map(b=>b._id)
//       if(candidates.length==0){
//         await order.save()
//         return res.json({message:' order status update  there is No delivery boy available'})
//       }
//       const deliveryAssignment = await DeliveryAssignment.create({
//         order: order._id,
//         shop: shopOrder.shop,
//         shopOrderId: shopOrder._id,
//         brodcastedTo: candidates,
//         status:'brodcasted',
//       })
//       shopOrder.assignedDeliveryBoy=deliveryAssignment.assignedTo
//       shopOrder.assignment = deliveryAssignment._id
//       deliveryBoysPayload=availableBoys.map(b=>({
//         id:b._id,
//         fullName:b.fullName,
//         longitude:b.location.coordinates?.[0],
//         latitude:b.location.coordinates?.[1],
//         mobile:b.mobile
//       }))
       
//     }

//     await shopOrder.save()
//     await order.save()
//     await order.populate("shopOrder.shop","name")
//      await order.populate("shopOrder.assignedDeliveryBoy","fullName email email")

     
//      const updatedShopOrder=order.shopOrders.find(o => o.shop == shopId)

//     return res.status(200).json({
//       shopOrder:updatedShopOrder,
//       assignedDeliveryBoy:updatedShopOrder?.assignedDeliveryBoy,
//       availableBoys:deliveryBoysPayload,
//       assignment:updatedShopOrder?.assignment._id
//     })
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: ` orders status error: ${error.message}` })
//   }
// }

// import Order from '../models/orderModel.js'
// import Shop from '../models/shopModel.js'

// export const placeOrder = async (req, res) => {
//   try {
//     const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
//     if (cartItems.length == 0 || !cartItems) {
//       return res.status(400).json({ message: 'Cart is empty' })
//     }
//     if (
//       !deliveryAddress.text ||
//       !deliveryAddress.latitude ||
//       !deliveryAddress.longitude
//     ) {
//       return res.status(400).json({ message: 'Delivery address is required' })
//     }

//     const groupItemsByShop = {}
//     cartItems.forEach(item => {
//       const shopId = item.shop
//       if (!groupItemsByShop[shopId]) {
//         groupItemsByShop[shopId] = []
//       }
//       groupItemsByShop[shopId].push(item)
//     })

//     const shopOrders = await Promise.all(
//       Object.keys(groupItemsByShop).map(async shopId => {
//         const shop = await Shop.findById(shopId).populate('owner')
//         if (!shop) {
//           return res
//             .status(404)
//             .json({ message: `Shop with id ${shopId} not found` })
//         }
//         const items = groupItemsByShop[shopId]
//         const subtotal = items.reduce(
//           (sum, i) => sum + Number(i.price) * Number(i.quantity),
//           0
//         )
//         return {
//           shop: shop._Id,
//           owner: shop.owner._id,
//           subtotal,
//           shopOrderItems: items.map(
//             (i = {
//               item: i._id,
//               price: i.price,
//               quantity: i.quantity,
//               name: i.name
//             })
//           )
//         }
//       })
//     )

//     const newOrder = await Order.create({
//       user: req.user._id,
//       paymentMethod,
//       deliveryAddress,
//       totalAmount,
//       shopOrders
//     })
//     return res.status(201).json(newOrder)
//   } catch (error) {
//     return res.status(500).json({ message: `Place order error ${error}` })
//   }
// }
