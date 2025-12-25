import React, { useEffect } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import UserOrderCard from '../components/UserOrderCard'
import OwnerOrderCard from '../components/OwnerOrderCard'
import { initSocket } from '../../socket.js'
import { serverUrl } from '../App'
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice'
const MyOrders = () => {
  const { userData, MyOrders } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // useEffect(() => {
  //   const socket = initSocket(serverUrl)
  //   const handleNewOrder = data => {
  //     if (data.shopOrders.owner._id === userData._id) {
  //       dispatch(setMyOrders([data,...myOrders]))
  //     }
  //   }
  //   socket.on("newOrder", handleNewOrder);

  // return () => {
  //   socket.off("newOrder");
  // };
  // },[userData])
  useEffect(() => {
  if (!userData?._id) return;

  const socket = initSocket(serverUrl);

  const handleNewOrder = (data) => {
  if (data.shopOrders?.owner?._id === userData._id) {
    dispatch(setMyOrders([data, ...(MyOrders || [])]));
  }
};

  socket.on("newOrder", handleNewOrder);

  socket.on("orderStatusUpdated",({orderId,shopId,status,userId})=>{
     if(userId == userData._id){
      dispatch(updateRealtimeOrderStatus({orderId,shopId,status}))
     }
  })

  return () => {
    socket.off("newOrder", handleNewOrder); // ✅ proper cleanup
    socket.off("orderStatusUpdated");
  };
}, [userData, MyOrders]);

  return (
    <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>
        <div className='flex items-center justify-center mb-6 relative'>
          <IoIosArrowRoundBack
            size={35}
            className='text-[#ff4d2d] absolute left-0 cursor-pointer'
            onClick={() => navigate('/')}
          />

          <h1 className='text-2xl font-bold'>My Orders</h1>
        </div>

        <div className='space-y-6'>
          {MyOrders?.map((order, index) =>
            userData.role == 'user' ? (
              <UserOrderCard data={order} key={index} />
            ) : userData.role == 'owner' ? (
              <OwnerOrderCard data={order} key={index} />
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
