import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import UserOrderCard from '../components/UserOrderCard'
import OwnerOrderCard from '../components/OwnerOrderCard'
const MyOrders = () => {
  const { userData, MyOrders } = useSelector(state => state.user)
  const navigate = useNavigate()
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
