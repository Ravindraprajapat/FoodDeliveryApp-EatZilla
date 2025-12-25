import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { serverUrl } from '../App'
const UserOrderCard = ({ data }) => {
  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const navigate = useNavigate();
  const [selectedRating,setSelectedRating]=useState({})


  const handleRating = async (itemId,rating) =>{
    try {
      const result = await axios.post(`${serverUrl}/api/item/rating`,{
        itemId,
        rating
      },{withCredentials:true})
      console.log(result.data)
      setSelectedRating(prev=>({
        ...prev,
        [itemId]:rating     
      }))
    } catch (error){
      console.log("Error while submitting rating:",error)
    }   
    }
  



  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      {/* Header */}
      <div className='flex justify-between border-b pb-2'>
        <div>
          <p className='font-semibold'>Order #{data._id.slice(-6)}</p>
          <p className='text-sm text-gray-500'>
            Date: {formatDate(data.createdAt)}
          </p>
        </div>

        <div className='text-right'>
          {data.paymentMethod=="cod" ? <p className='text-sm text-gray-500'>
            {data.paymentMethod?.toUpperCase()}
          </p> : <p className='text-sm text-gray-500 font-semibold'>
            Payment: {data.payment?"true":"false"}
          </p>}
          
          <p className='font-medium text-blue-600'>
            {data.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      {/* Shop Orders */}
      <div className='space-y-4'>
        {data.shopOrders.map((shopOrder, index) => (
          <div
            key={index}
            className='rounded-lg p-3 bg-[#fffaf7] flex flex-col space-y-3'
          >
            <p className='font-medium'>{shopOrder.shop.name}</p>

            {/* Items (scrollable) */}
            <div className='flex space-x-4 overflow-x-auto pb-2 w-full'>
              {shopOrder.shopOrderItems.map((item, idx) => (
                <div
                  key={idx}
                  className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'
                >
                  <img
                    src={item.item.image}
                    alt=''
                    className='w-full h-24 object-cover rounded'
                  />
                  <p className='font-semibold text-sm mt-1'>{item.item.name}</p>
                  <p className='text-xs text-gray-500'>
                    Qty {item.quantity} × ₹{item.price}
                  </p>

                  {shopOrder.status=="delivered" && <div className='flex space-x-1 mt-2'>
                      {[1,2,3,4,5].map((star)=>(
                        <button 
                          onClick={()=>handleRating(item.item._id,star)}
                        className={` cursor-pointer text-lg ${selectedRating[item.item._id]>=star?"text-yellow-400":"text-gray-400"}`}>
                          ★
                        </button>
                      ))}
                    </div>}

                </div>
              ))}
            </div>

            {/* Subtotal (fixed position) */}
            <div className='flex justify-between items-center border-t pt-2 w-full'>
              <p className='font-semibold'>Subtotal: ₹{shopOrder.subtotal}</p>
              <p className='text-sm font-medium text-blue-600'>
                {shopOrder.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>Total: ₹{data.totalAmount}</p>
        <button
           onClick={()=>navigate(`/track-order/${data._id}`)}
         className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm cursor-pointer'>
          Track Order
        </button>
      </div>
    </div>
  )
}

export default UserOrderCard
