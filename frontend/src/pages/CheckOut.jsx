import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { FaLocationDot } from 'react-icons/fa6'
import { IoSearchSharp } from 'react-icons/io5'
import { TbCurrentLocation } from 'react-icons/tb'
import { MdDeliveryDining } from 'react-icons/md'
import { FaCreditCard } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { FaMobileScreenButton } from 'react-icons/fa6'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { setAddress, setLocation } from '../redux/mapSlice'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { serverUrl } from '../App'
import { addMyOrder } from '../redux/userSlice'

/* ✅ FIX 1: props destructuring */
function RecenterMap ({ location }) {
  const map = useMap()

  if (location?.lat && location?.lon) {
    map.setView([location.lat, location.lon], 16, { animate: true })
  }

  return null
}

const CheckOut = () => {
  const apikey = import.meta.env.VITE_GEOAPIKEY
  const { location, address } = useSelector(state => state.map)
  const { CardItems, TotalAmount, userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [addressInput, setAddressInput] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const DeliveryFee = TotalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = TotalAmount + DeliveryFee

  const onDragEnd = e => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat: lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`
      )

      dispatch(setAddress(result?.data.results[0].address_line2))
    } catch (error) {
      console.log('Error in fetching address by latlng:', error)
    }
  }

  const getCurrentLocation = () => {
    const latitude = userData.location.coordinates[1]
    const longitude = userData.location.coordinates[0]

    dispatch(setLocation({ lat: latitude, lon: longitude }))

    getAddressByLatLng(latitude, longitude)
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apikey}`
      )
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log('Error in fetching latlng by address:', error)
    }
  }

  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          cartItems: CardItems,
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon
          },
          totalAmount: AmountWithDeliveryFee
        },
        { withCredentials: true }
      )

      if (paymentMethod == 'cod') {
        dispatch(addMyOrder(result.data))
        navigate('/order-placed')
      }
      else{
        const orderId = result.data.orderId
      const razorOrder= result.data.razorOrder
        openRazorPayWindow(orderId,razorOrder)
      }
    } catch (error) {
      console.log('Error in placing order:', error)
    }
  }

  const openRazorPayWindow = (orderId, razorOrder) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: razorOrder.amount,
    currency: razorOrder.currency,
    name: "EatZilla",
    description: "Food Delivery Website",
    order_id: razorOrder.id,

    handler: async function (response) {
      try {
        const result = await axios.post(
          `${serverUrl}/api/order/verify-payment`,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id, // ✅ MISSING LINE (MAIN FIX)
            orderId
          },
          { withCredentials: true }
        );

        dispatch(addMyOrder(result.data));
        navigate("/order-placed");
      } catch (error) {
        console.log("Error in verifying payment:", error);
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


  useEffect(() => {
    setAddressInput(address)
  }, [address])

  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
      <div
        onClick={() => navigate('/')}
        className='absolute top-[20px] left-[20px] z-[10] cursor-pointer'
      >
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
      </div>

      <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-2xl p-6 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>CheckOut</h1>

        {/* Section for a Map */}

        <section>
          <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
            <FaLocationDot className='text-[#ff4d2d]' />
            Delivery Location
          </h2>

          <div className='flex gap-2 mb-3'>
            <input
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              type='text'
              placeholder='Enter your Delivery Address'
              className='flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]'
            />
            <button
              onClick={getLatLngByAddress}
              className='bg-[#ff4d2d] text-white px-3 py-2 rounded-lg cursor-pointer'
            >
              <IoSearchSharp size={17} />
            </button>
            <button
              onClick={getCurrentLocation}
              className='bg-blue-500 text-white px-3 py-2 rounded-lg cursor-pointer'
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>

          <div className='rounded-xl border overflow-hidden'>
            <div className='h-64 w-full'>
              {/* ✅ FIX 3: safe center */}
              {location?.lat && location?.lon && (
                <MapContainer
                  className='w-full h-full'
                  center={[location.lat, location.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />

                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />

                  <RecenterMap location={location} />
                </MapContainer>
              )}
            </div>
          </div>
        </section>
        {/* Section for Payment method */}
        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>
            Payment Method
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div
              className={` cursor-pointer flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === 'cod'
                  ? 'border-[#ff4d2d] bg-orange-50 shadow'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('cod')}
            >
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100'>
                <MdDeliveryDining className='text-green-600 text-xl' />
              </span>
              <div>
                <p className='font-medium text-gray-800 '>Cash On Delivery</p>
                <p className='text-xs text-gray-500 '>
                  Pay when our food arrives
                </p>
              </div>
            </div>
            <div
              className={` cursor-pointer flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                paymentMethod === 'online'
                  ? 'border-[#ff4d2d] bg-orange-50 shadow'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('online')}
            >
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100'>
                <FaMobileScreenButton className='text-purple-700 text-lg' />
              </span>
              <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                <FaCreditCard className='text-blue-700 text-lg' />
              </span>
              <div>
                <p className='font-medium text-gray-800 '>
                  UPI / Credit / Debit Card
                </p>
                <p className='text-xs text-gray-500'>Pay Security Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='text-lg font-semibold mb-3 text-gray-800'>
            Order Summary
          </h2>
          <div className='rounded-xl border bg-gray-50 p-4 space-y-2'>
            {CardItems?.map((item, index) => (
              <div
                key={index}
                className='flex justify-between text-sm text-gray-700'
              >
                <span>
                  {item.name} x {item.quantity}{' '}
                </span>
                <span>
                  ₹{item.price}*{item.quantity}
                </span>
              </div>
            ))}
            <hr className=' border-gray-200 my-2' />
            <div className='flex justify-between font-medium text-gray-800'>
              <span>Subtotal</span>
              <span>{TotalAmount}</span>
            </div>
            <div className='flex justify-between text-gray-700'>
              <span>Delivery Fee</span>
              <span>{DeliveryFee == 0 ? 'Free' : DeliveryFee}</span>
            </div>
            <div className='flex justify-between text-lg font-bold text-[#ff4d2d] pt-2'>
              <span>Total</span>
              <span>{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>
        <button
          onClick={handlePlaceOrder}
          className=' cursor-pointer w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold'
        >
          {paymentMethod === 'cod' ? 'Place Order' : 'Pay & Place Order'}
        </button>
      </div>
    </div>
  )
}

export default CheckOut
