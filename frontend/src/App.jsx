import { useState } from 'react'

import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'

import ZsignUp from './pages/ZsignUp'
import ZsignIn from './pages/ZsignIn'
import ForgetPassword from './pages/ForgetPassword'
import UseGetCurrentUser from './hooks/UseGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import UseGetCity from './hooks/UseGetCity'
import UseGetMyShop from './hooks/UseGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import UseGetShopByCity from './hooks/UseGetShopByCity'
import UseGetItemByCity from './hooks/UseGetItemByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import UseGetMyOrders from './hooks/UseGetMyOrders'
import UseUpdateLocation from './hooks/UseUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { useEffect } from 'react'

import { initSocket, disconnectSocket } from '../socket.js'

export const serverUrl = 'http://localhost:8000'

function App () {
  // const dispatch = useDispatch()
  //  const socket = useSelector((state) => state.user.socket);
const { userData } = useSelector(state => state.user)
  UseGetCurrentUser()
  UseUpdateLocation()
  UseGetCity()
  UseGetMyShop()
  UseGetShopByCity()
  UseGetItemByCity()
  UseGetMyOrders()

  useEffect(() => {
    const socket = initSocket(serverUrl)

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      
      if(userData){
        socket.emit('identity', { userId: userData._id });
      }

    })

    

    return () => {
      disconnectSocket()
    }
  }, [userData?._id])
  // useEffect(()=>{
  //  const socketInstance = io(serverUrl,{withCredentials:true})
  //  dispatch(setSocket(socketInstance))
  //  socketInstance.on('connect',(socket)=>{
  //   console.log(socket)
  //  })
  // },[])

  
  return (
    <Routes>
      <Route
        path='/signup'
        element={!userData ? <ZsignUp /> : <Navigate to={'/'} />}
      />
      <Route
        path='/signin'
        element={!userData ? <ZsignIn /> : <Navigate to={'/'} />}
      />
      <Route
        path='/forget-password'
        element={!userData ? <ForgetPassword /> : <Navigate to={'/'} />}
      />
      <Route
        path='/'
        element={userData ? <Home /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/create-edit-shop'
        element={userData ? <CreateEditShop /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/add-item'
        element={userData ? <AddItem /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/edit-item/:itemId'
        element={userData ? <EditItem /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/cart'
        element={userData ? <CartPage /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/checkout'
        element={userData ? <CheckOut /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/order-placed'
        element={userData ? <OrderPlaced /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/my-orders'
        element={userData ? <MyOrders /> : <Navigate to={'/signin'} />}
      />

      <Route
        path='/track-order/:orderId'
        element={userData ? <TrackOrderPage /> : <Navigate to={'/signin'} />}
      />
      <Route
        path='/shop/:shopId'
        element={userData ? <Shop /> : <Navigate to={'/signin'} />}
      />
    </Routes>
  )
}

export default App
