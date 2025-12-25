import User from './models/userModel.js'

export const socketHandler = async io => {
  io.on('connection', socket => {
    socket.on('identity', async ({ userId }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true
          },
          { new: true }
        )
      } catch (error) {
        console.log('Error in setting socketId:', error.message)
      }
    })

    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          io.emit('updateDeliveryLocation',{
            deliveryBoyId:userId,
            latitude,
            longitude
          })
        }
      } catch (error) {
        console.log('Error in updating location:', error.message)
      }
    })

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            isOnline: false,
            socketId: null
          }
        )
      } catch (error) {
        console.log('Error in removing socketId:', error.message)
      }
    })
  })
}
