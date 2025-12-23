import mongoose from 'mongoose'
const deliveryAssignment = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    },
    shopOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    brodcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['brodcasted', 'assigned', 'completed'],
      default: 'brodcasted'
    },
    acceptedAt: Date
  },
  { timestamps: true }
)

const DeliveryAssignment = mongoose.model("DeliveryAssignment",deliveryAssignment)
export default DeliveryAssignment