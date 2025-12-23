import React, { useRef, useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaUtensils } from 'react-icons/fa'
import { IoCloudUploadOutline } from 'react-icons/io5'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'

const AddItem = () => {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)

  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [category, setCategory] = useState('')
  const [foodType, setFoodType] = useState('veg')
  const[loading , setLoading] = useState(false)

  const categories = [
    'Snacks',
    'Main Course',
    'Desserts',
    'Pizza',
    'Burgers',
    'Sandwiches',
    'South Indian',
    'North Indian',
    'Chinese',
    'Fast Food',
    'Others'
  ]

  const dispatch = useDispatch()

  const handleImage = e => {
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    setLoading(true)
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('category', category)
      formData.append('foodType', foodType)
      formData.append('price', price)

      // NEW IMAGE SELECTED
      if (backendImage) {
        formData.append('image', backendImage)
      }
      // OLD IMAGE PRESERVE (Edit Mode)
      else if (myShopData?.image) {
        formData.append('existingImage', myShopData.image)
      }

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      )
      
      setLoading(false)
      console.log(result?.data)

      dispatch(setMyShopData(result.data))
      
    } catch (error) {
      setLoading(false)
      console.log('Submit Error:', error.response?.data || error.message)
    }
  }

  return (
    <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen'>
      <div className=' absolute top-[20px] left-[20px] z-[10] mb-[10px] '>
        <IoIosArrowRoundBack
          size={35}
          className='text-[#ff4d2d]'
          onClick={() => navigate('/')}
        />
      </div>

      <div className=' max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100 '>
        <div className=' flex flex-col items-center mb-6 '>
          <div className='bg-orange-100 p-4 rounded-full mb-4'>
            <FaUtensils className='text-[#ff4d2d] w-16 h-16 ' />
          </div>
          <div className='text-3xl font-extrabold text-gray-900'>Add Food</div>
        </div>

        <form className=' space-y-5 ' onSubmit={handleSubmit}>
          <div>
            <label className=' block text-sm font-medium text-gray-700 mb-1 '>
              Name
            </label>
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              type='text'
              placeholder='Enter Food Name'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>

          <div>
            <label className=' block text-sm font-medium text-gray-700 mb-1 '>
              Price
            </label>
            <input
              onChange={e => setPrice(e.target.value)}
              value={price}
              type='number'
              placeholder='0'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            />
          </div>

          <div>
            <label className=' block text-sm font-medium text-gray-700 mb-1 '>
              Select Category
            </label>
            <select
              onChange={e => setCategory(e.target.value)}
              value={category}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              <option value="">Select Category</option>
              {categories.map((cate,index)=>(
                <option value={cate} key={index}>{cate}</option>
              ))}
            </select>
          </div>

           <div>
            <label className=' block text-sm font-medium text-gray-700 mb-1 '>
              Select Food Type
            </label>
            <select
              onChange={e => setFoodType(e.target.value)}
              value={foodType}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              
              <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Food Image
            </label>

            <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-orange-500 transition'>
              <IoCloudUploadOutline className='text-4xl text-gray-600 mb-2' />
              <span className='text-gray-600'>Click to upload image</span>

              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImage}
              />
            </label>

            {frontendImage && (
              <div className='mt-3'>
                <img
                  src={frontendImage}
                  alt='Preview'
                  className='w-full h-40 object-cover rounded-lg border'
                />
              </div>
            )}
          </div>

          <button className='w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer' onClick={()=>navigate("/")} disabled={loading}>
          {loading?<ClipLoader size={20} color='white'/>:"Save"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddItem
