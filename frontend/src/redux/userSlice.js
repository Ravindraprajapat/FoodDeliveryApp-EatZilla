import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    CurrentCity: null,
    CurrentState: null,
    CurrentAddress: null,
    ShopsInMyCity: null,
    ItemsInMyCity: null,
    CardItems: [],
    TotalAmount: 0,
    MyOrders: []
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setCurrentCity: (state, action) => {
      state.CurrentCity = action.payload
    },
    setCurrentState: (state, action) => {
      state.CurrentState = action.payload
    },
    setCurrentAddress: (state, action) => {
      state.CurrentAddress = action.payload
    },
    setShopInMyCity: (state, action) => {
      state.ShopsInMyCity = action.payload
    },
    setItemsInMyCity: (state, action) => {
      state.ItemsInMyCity = action.payload
    },
    addToCard: (state, action) => {
      const cardItem = action.payload
      const existingItem = state.CardItems.find(i => i._id == cardItem.id)
      if (existingItem) {
        existingItem.quantity += cardItem.quantity
      } else {
        state.CardItems.push(cardItem)
      }
      state.TotalAmount = state.CardItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      )
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.CardItems.find(i => i._id == id)
      if (item) {
        item.quantity = quantity
      }
      state.TotalAmount = state.CardItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      )
    },

    removeCartItem: (state, action) => {
      state.CardItems = state.CardItems.filter(i => i._id != action.payload)
      state.TotalAmount = state.CardItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      )
    },

    setMyOrders: (state, action) => {
      state.MyOrders = action.payload
    },
    addMyOrder: (state, action) => {
      state.MyOrders = [action.payload, ...state.MyOrders]
    },
    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload

      const order = state.MyOrders.find(o => o._id === orderId)

      if (order && order.shopOrders && order.shopOrders.shop._id === shopId) {
        order.shopOrders.status = status
      }
    }
  }
})

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopInMyCity,
  setItemsInMyCity,
  addToCard,
  updateQuantity,
  removeCartItem,
  setMyOrders,
  addMyOrder,
  updateOrderStatus
} = userSlice.actions
export default userSlice.reducer

// updateOrderStatus:(state,action)=>{
//         const {orderId,shopId, status} = action.payload
//         const order = state.MyOrders.find(o=>o._id == orderId)
//         if(order){
//             if(order.shopOrders && order.shopOrders.shop._id == shopId){

//             }
//         }
