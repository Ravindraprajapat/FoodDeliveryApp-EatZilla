import React, { useEffect, useState } from 'react'
import { IoCartOutline } from 'react-icons/io5'
import { FaLocationDot } from 'react-icons/fa6'
import { FaPlus } from 'react-icons/fa6'
import { IoMdSearch } from 'react-icons/io'
import { RxCross2 } from 'react-icons/rx'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setSearchItems, setUserData } from '../redux/userSlice'
import { TbReceiptDollar } from 'react-icons/tb'
import { useNavigate } from 'react-router-dom'
const Nav = () => {
  const { userData, CurrentCity,MyOrders } = useSelector(state => state.user)
  const { myShopData } = useSelector(state => state.owner)
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [query,setQuery]=useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { CardItems } = useSelector(state => state.user)
  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true
      })
      dispatch(setUserData(null))
    } catch (error) {
      console.log(error)
    }
  }

  const toggleInfo = () => {
    setShowInfo(prev => !prev)
  }

   const handleSearchItems = async ()=>{
     try {
       const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${CurrentCity}`,{withCredentials:true})
       
       dispatch(setSearchItems(result.data))
     } catch (error) {
        console.log(error)
     }
    }

    useEffect(()=>{
      if(query){
   handleSearchItems()
      }
      else{
        dispatch(setSearchItems(null))
      }
    },[query])

  return (
    <div
      className='w-full h-[80px] flex items-center justify-between 
    md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] 
    bg-[#fff9f6] overflow-visible'
    >
      {showSearch && userData.role == 'user' && (
        <div
          className='
    w-[90%] max-w-[500px] 
    bg-white shadow-xl rounded-lg 
    flex items-center gap-[10px] 
    fixed top-[80px] left-1/2 -translate-x-1/2
    px-[10px] py-[8px]
    md:hidden
  '
        >
          {/* Location part */}
          <div className='flex items-center gap-[6px] flex-shrink-0'>
            <FaLocationDot size={20} className='text-[#ff4d2d]' />
            <div className='max-w-[80px] truncate text-gray-600 text-sm'>
              {CurrentCity}
            </div>
          </div>

          {/* Search part */}
          <div className='flex items-center gap-[8px] flex-1'>
            <IoMdSearch size={20} className='text-[#ff4d2d]' />
            <input
            onChange={(e)=>setQuery(e.target.value)}
              value={query}
              type='text'
              placeholder='search delicious food...'
              className='text-gray-700 outline-0 w-full text-sm'
            />
          </div>
        </div>
      )}

      <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>EatZilla</h1>
      {userData.role == 'user' && (
        <div className=' md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex '>
          <div className=' flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400 '>
            <FaLocationDot size={25} className=' text-[#ff4d2d] ' />
            <div className=' w-[80%] truncate text-gray-600  '>
              {CurrentCity}
            </div>
          </div>
          <div className=' w-[80%] flex items-center gap-[10px] '>
            <IoMdSearch size={25} className='text-[#ff4d2d]' />
            <input
              onChange={(e)=>setQuery(e.target.value)}
              value={query}
              type='text'
              placeholder='search delicious food...'
              className=' px-[10px] text-gray-700 outline-0 w-full '
            />
          </div>
        </div>
      )}

      <div className='flex items-center gap-4 '>
        {userData.role == 'user' &&
          (showSearch ? (
            <RxCross2
              size={25}
              className='text-[#ff4d2d] md:hidden '
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoMdSearch
            onChange={(e)=>setQuery(e.target.value)}
              value={query}
              size={25}
              className='text-[#ff4d2d] md:hidden '
              onClick={() => setShowSearch(true)}
            />
          ))}

        {/* owner */}
        {userData.role == 'owner' ? (
          <>
            {myShopData && (
              <>
                <button
                  className=' hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] text '
                  onClick={() => navigate('/add-item')}
                >
                  <FaPlus size={20} />
                  <span>Add Food Item</span>
                </button>

                <button
                  className=' md:hidden flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] text '
                  onClick={() => navigate('/add-item')}
                >
                  <FaPlus size={20} />
                </button>
              </>
            )}

            <div
              onClick={() => navigate('/my-orders')}
              className=' hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium '
            >
              <TbReceiptDollar size={20} />
              <span>My Orders</span>
              {/* <span className=' absolute -right-2 -top-2 text-xs fond-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]  '>
                0
              </span> */}
            </div>

            <div
              onClick={() => navigate('/my-orders')}
              className=' md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium '
            >
              <TbReceiptDollar size={20} />

              {/* <span className=' absolute -right-2 -top-2 text-xs fond-bold text-white bg-[#ff4d2d] rounded-full px-[6px] py-[1px]  '>
                0
              </span> */}
            </div>
          </>
        ) : (
          <>
            {userData.role == 'user' && (
              <div
                className=' relative cursor-pointer'
                onClick={() => navigate('/cart')}
              >
                <IoCartOutline size={25} className='text-[#ff4d2d]' />
                <span className=' absolute right-[-9px] top-[-12px] text-[#ff4d2d] '>
                  {CardItems.length}
                </span>
              </div>
            )}

            <button
              onClick={() => navigate('/my-orders')}
              className=' cursor-pointer hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium '
            >
              My Orders
            </button>
          </>
        )}

        <div
          onClick={toggleInfo}
          className=' w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer'
        >
          {userData.fullName.slice(0, 1)}
        </div>
        {showInfo && (
          <div
            className={`fixed top-[80px]
  ${
    userData.role === 'deliveryBoy'
      ? 'right-[10px] md:right-[20%] lg:right-[35%]'
      : 'right-[10px] md:right-[10%] lg:right-[25%]'
  }
  w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]`}
          >
            <div className='text-[17px] font-semibold '>
              {userData.fullName}
            </div>
            {userData.role == 'user' && (
              <>
                <div
                  onClick={() => navigate('/my-orders')}
                  className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer  '
                >
                  My Orders
                </div>
              </>
            )}

            <div
              onClick={handleLogout}
              className='text-[#ff4d2d] font-semibold cursor-pointer'
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Nav
