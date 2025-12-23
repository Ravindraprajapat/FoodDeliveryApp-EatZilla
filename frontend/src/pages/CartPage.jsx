import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import CartItemsCard from '../components/CartItemsCard'
const CartPage = () => {
  const navigate = useNavigate()
  const { CardItems, TotalAmount } = useSelector(state => state.user)
  return (
    <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
      <div className='w-full max-w-[800px] relative'>
        <div className='flex items-center justify-center mb-6 relative'>
          <IoIosArrowRoundBack
            size={35}
            className='text-[#ff4d2d] absolute left-0 cursor-pointer'
            onClick={() => navigate('/')}
          />

          <h1 className='text-2xl font-bold'>Your Cart</h1>
        </div>
        {CardItems?.length == 0 ? (
          <p className='text-gray-500 text-lg text-center '>
            Your cart is empty.
          </p>
        ) : (
          <>
            <div className='space-y-4'>
              {CardItems.map((item, index) => (
                <CartItemsCard data={item} key={index} />
              ))}
            </div>
            <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
              <h1 className='text-xl font-semibold'>Total Amount</h1>
              <span className='text-xl font-bold text-[#ff4d2d]'>
                ₹{TotalAmount}
              </span>
            </div>
            <div>
              <div className='mt-4 flex justify-end'>
                <button
                onClick={()=>navigate("/checkout")}
                className= 'cursor-pointer bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition'>
                 Proceed to CheckOut
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
