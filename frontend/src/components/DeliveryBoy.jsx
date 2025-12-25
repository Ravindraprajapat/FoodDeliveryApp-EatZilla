import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { initSocket } from '../../socket'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ClipLoader } from 'react-spinners'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
)


const DeliveryBoy = () => {
  const [availableAssignments, setAvailableAssignments] = useState([])
  const { userData } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading ,setLoading]=useState(false)
  const [message,setMessage]=useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)

  const chartData = {
  labels: todayDeliveries.map(d => `${d.hour}:00`),
  datasets: [
    {
      data: todayDeliveries.map(d => d.count),
      backgroundColor: '#ff4d2d',
      borderRadius: 4,
      barThickness: 40,    
      maxBarThickness: 45
    }
  ]
}

 const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#000',
      bodyColor: '#ff4d2d',
      borderColor: '#ddd',
      borderWidth: 1,
      padding: 10,
      displayColors: false, // ❌ color box hide
      callbacks: {
        title: (tooltipItems) => {
          return tooltipItems[0].label   // "13:00"
        },
        label: (tooltipItem) => {
          return `orders : ${tooltipItem.raw}` // "orders : 2"
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0
      }
    }
  }
}

  useEffect(() => {
    const socket = initSocket(serverUrl)
    if (!socket || userData.role !== 'deliveryBoy') {
      return
    }
    let watchId
    if (navigator.geolocation) {
      ;(watchId = navigator.geolocation.watchPosition(position => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude
        setDeliveryBoyLocation({ lat: latitude, lon: longitude })
        socket.emit('updateLocation', {
          latitude,
          longitude,
          userId: userData._id
        })
      })),
        error => {
          console.log(error)
        },
        {
          enableHighAccuracy: true
        }
    }
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [userData])

  const ratePerDelivery = 50
  const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0
  )

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignment`, {
        withCredentials: true
      })
      console.log('Assignments fetched:', result.data)
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log('Error while fetching assignments:', error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        {
          withCredentials: true
        }
      )
      console.log('current orders', result.data)
      setCurrentOrder(result.data)
    } catch (error) {
      console.log('Error while fetching currents order:', error)
    }
  }

  const acceptOrder = async assignmentId => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        {
          withCredentials: true
        }
      )
      console.log('Assignments fetched:', result.data)
      await getCurrentOrder()
    } catch (error) {
      console.log('Error while fetching assignments:', error)
    }
  }

  const sendOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id
        },
        {
          withCredentials: true
        }
      )
      setLoading(false)
      setShowOtpBox(true)
      console.log(result.data)
    } catch (error) {
      setLoading(false)
      console.log('Error while fetching assignments:', error)
    }
  }

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp
        },
        {
          withCredentials: true
        }
      )
      console.log(result.data)
      setMessage(result.data.message)
      location.reload()
    } catch (error) {
      console.log('Error while fetching assignments:', error)
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        {
          withCredentials: true
        }
      )
      console.log('today deliveries', result.data)
      setTodayDeliveries(result.data)
    } catch (error) {
      console.log('Error while fetching assignments:', error)
    }
  }

  useEffect(() => {
    const socket = initSocket(serverUrl)
    socket.on('newAssignment', data => {
      if (data.sendTo == userData._id) {
        setAvailableAssignments(prev => [...prev, data])
      }
    })

    return () => {
      socket.off('newAssignment')
    }
  }, [])

  useEffect(() => {
    getCurrentOrder()
    getAssignments()
    handleTodayDeliveries()
  }, [userData])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
        <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-between items-center w-[90%] border border-orange-100 text-center gap-2'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>
            Welcome, {userData.fullName}
          </h1>
          <p className='text-[#ff4d2d]'>
            <span className='font-semibold'>Latitude:</span>
            {deliveryBoyLocation?.lat},
            <span className='text-semibold'>Longitude:</span>
            {deliveryBoyLocation?.lon}
          </p>
        </div>

        <div className='bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100'>
          <h1 className='text-lg font-bold mb-3 text-[#ff4d2d]'>
            Today Deliveries
          </h1>
          {todayDeliveries.length > 0 && (
            <div style={{ height: 200 }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}

          <div className='max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg'>
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>
              Today's Earning
            </h1>
            <span className='text-3xl font-bold text-green-600'>
              ₹{totalEarning}
            </span>
          </div>
        </div>

        {!currentOrder && (
          <>
            <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
              <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
                Available Orders
              </h3>

              <div className='space-y-4'>
                {availableAssignments.length > 0 ? (
                  availableAssignments.map((a, index) => (
                    <div
                      className=' border rounded-lg p-4 flex justify-between items-center'
                      key={index}
                    >
                      <div>
                        <p className='text-sm font-semibold'>{a.shopName}</p>
                        <p className='text-sm text-gray-500'>
                          <span className='font-semibold'>
                            Delivery Address:
                          </span>{' '}
                          {a.deliveryAddress.text}
                        </p>
                        <p className='text-xs text-gray-400'>
                          {a.items?.length} items | {a.subtotal}
                        </p>
                      </div>
                      <button
                        onClick={() => acceptOrder(a.assignmentId)}
                        className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600'
                      >
                        Accept
                      </button>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-400 text-sm'>No Available Orders</p>
                )}
              </div>
            </div>
          </>
        )}

        {currentOrder && (
          <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
            <h2 className='text-lg font-bold mb-3'>📦 Current Order</h2>

            <div className='border rounded-lg p-4 mb-3'>
              <p className='font-semibold text-sm'>
                {currentOrder?.shopOrder?.shop?.name}
              </p>

              <p className='text-sm text-gray-500'>
                {currentOrder?.deliveryAddress?.text}
              </p>

              <p className='text-xs text-gray-400'>
                {currentOrder?.shopOrder?.shopOrderItems?.length} items | ₹
                {currentOrder?.shopOrder?.subtotal}
              </p>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude
                }
              }}
            />

            {!showOtpBox ? (
              <button
                className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200'
                onClick={sendOtp} disabled={loading}
              >
                {loading?<ClipLoader size={20} color='white'/>:"Mark As Delivered"}
              </button>
            ) : (
              <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
                <p className='text-sm font-semibold mb-2'>
                  Enter otp send to{' '}
                  <span className='text-orange-500'>
                    {currentOrder.user.fullName}
                  </span>
                </p>
                <input
                  type='text'
                  placeholder='Enter a Otp'
                  onChange={e => setOtp(e.target.value)}
                  value={otp}
                  className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400'
                />
                {message && <p className='text-center text-green-400'>{message}</p>}
                
                <button
                  onClick={verifyOtp}
                  className='w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all'
                >
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoy
