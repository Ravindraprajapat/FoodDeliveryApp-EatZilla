import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category.js'
import CategoryCard from './CategoryCard'
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import FoodCard from './FoodCard.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App.jsx'

const UserDashboard = () => {
  const { CurrentCity, ShopsInMyCity, ItemsInMyCity, searchItems } =
    useSelector(state => state.user)

  const cateScrollRef = useRef(null)
  const shopScrollRef = useRef(null)
  const navigate = useNavigate()

  const [showLeftCate, setShowLeftCate] = useState(false)
  const [showRightCate, setShowRightCate] = useState(false)
  const [showLeftShop, setShowLeftShop] = useState(false)
  const [showRightShop, setShowRightShop] = useState(false)

  // ✅ FIX: all shops items state
  const [updatedItemList, setUpdatedItemList] = useState([])

  // ✅ FIX: collect items from ALL shops
  useEffect(() => {
    if (ShopsInMyCity?.length) {
      const allItems = ShopsInMyCity.flatMap(shop => shop.items || [])
      setUpdatedItemList(allItems)
    }
  }, [ShopsInMyCity])

  // ✅ FIX: category filter on ALL items
  const handleFilterByCategory = category => {
    const allItems = ShopsInMyCity.flatMap(shop => shop.items || [])

    if (category === 'All') {
      setUpdatedItemList(allItems)
    } else {
      const filtered = allItems.filter(
        item => item.category === category
      )
      setUpdatedItemList(filtered)
    }
  }

  const updateButton = (ref, setLeft, setRight) => {
    const el = ref.current
    if (!el) return

    setLeft(el.scrollLeft > 0)
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
  }

  const scrollHandler = (ref, dir) => {
    if (!ref.current) return
    ref.current.scrollBy({
      left: dir === 'left' ? -220 : 220,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const cateEl = cateScrollRef.current
    const shopEl = shopScrollRef.current

    if (cateEl) {
      const fn = () =>
        updateButton(cateScrollRef, setShowLeftCate, setShowRightCate)
      cateEl.addEventListener('scroll', fn)
      fn()
      return () => cateEl.removeEventListener('scroll', fn)
    }

    if (shopEl) {
      const fn = () =>
        updateButton(shopScrollRef, setShowLeftShop, setShowRightShop)
      shopEl.addEventListener('scroll', fn)
      fn()
      return () => shopEl.removeEventListener('scroll', fn)
    }
  }, [categories, ShopsInMyCity])

  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-auto'>
      <Nav />

      {/* ================= SEARCH RESULT ================= */}
      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'>
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>
            Search Results
          </h1>

          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map(item => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* ================= CATEGORY SECTION ================= */}
      <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Inspiration for your first order
        </h1>

        <div className='relative w-full'>
          {showLeftCate && (
            <button
              className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full z-10'
              onClick={() => scrollHandler(cateScrollRef, 'left')}
            >
              <FaChevronCircleLeft />
            </button>
          )}

          <div
            ref={cateScrollRef}
            className='flex overflow-x-auto gap-4 pb-2 scroll-smooth'
          >
            {categories.map((cat, i) => (
              <CategoryCard
                key={i}
                name={cat.category}
                image={cat.image}
                onClick={() => handleFilterByCategory(cat.category)}
              />
            ))}
          </div>

          {showRightCate && (
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full z-10'
              onClick={() => scrollHandler(cateScrollRef, 'right')}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* ================= SHOP SECTION ================= */}
      <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Best Shops in {CurrentCity}
        </h1>

        <div className='flex overflow-x-auto gap-4 pb-2'>
          {ShopsInMyCity?.map((shop, i) => (
            <CategoryCard
              key={i}
              name={shop.name}
              image={shop.image}
              onClick={() => navigate(`/shop/${shop._id}`)}
            />
          ))}
        </div>
      </div>

      {/* ================= PRODUCT SECTION ================= */}
      <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Suggested Food Items
        </h1>

        <div className='w-full flex flex-wrap gap-[20px] justify-center'>
          {updatedItemList?.length > 0 ? (
            updatedItemList.map(item => (
              <FoodCard key={item._id} data={item} />
            ))
          ) : (
            <p className='text-gray-500'>No items found</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard


// import React, { useEffect, useRef, useState } from 'react'
// import Nav from './Nav'
// import { categories } from '../category.js'
// import CategoryCard from './CategoryCard'
// import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa'
// import { useSelector } from 'react-redux'
// import FoodCard from './FoodCard.jsx'

// const UserDashboard = () => {
//   const { CurrentCity, ShopsInMyCity,ItemsInMyCity } = useSelector(state => state.user)

//   const cateScrollRef = useRef(null)
//   const shopScrollRef = useRef(null)

//   const [showLeftCate, setShowLeftCate] = useState(false)
//   const [showRightCate, setShowRightCate] = useState(false)

//   const [showLeftShop, setShowLeftShop] = useState(false)
//   const [showRightShop, setShowRightShop] = useState(false)
//   const [updatedItemList,setUpdatedItemList] = useState([])

//   const  handleFilterByCategory = (category) =>{
//      if(category == "All"){
//       setUpdatedItemList(ItemsInMyCity)
//      }
//      else{
//       const filteredItems = ItemsInMyCity.filter(item => item.category === category);
//       setUpdatedItemList(filteredItems)
//      }
//   }

//   const updateButton = (ref, setLeft, setRight) => {
//     const el = ref.current
//     if (!el) return

//     setLeft(el.scrollLeft > 0)
//     setRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
//   }

//   const scrollHandler = (ref, dir) => {
//     if (!ref.current) return

//     ref.current.scrollBy({
//       left: dir === 'left' ? -220 : 220,
//       behavior: 'smooth'
//     })
//   }

//   useEffect(() => {
//     const cateEl = cateScrollRef.current
//     const shopEl = shopScrollRef.current

//     if (!cateEl && !shopEl) return

//     const handleCateScroll = () =>
//       updateButton(cateScrollRef, setShowLeftCate, setShowRightCate)

//     const handleShopScroll = () =>
//       updateButton(shopScrollRef, setShowLeftShop, setShowRightShop)

//     if (cateEl) {
//       cateEl.addEventListener('scroll', handleCateScroll)
//       handleCateScroll()
//     }

//     if (shopEl) {
//       shopEl.addEventListener('scroll', handleShopScroll)
//       handleShopScroll()
//     }

//     return () => {
//       if (cateEl) cateEl.removeEventListener('scroll', handleCateScroll)
//       if (shopEl) shopEl.removeEventListener('scroll', handleShopScroll)
//     }
//   }, [categories, ShopsInMyCity])

//   return (
//     <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-auto'>
//       <Nav />

//       {/* ================= CATEGORY SECTION ================= */}
//       <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
//         <h1 className='text-gray-800 text-2xl sm:text-3xl'>
//           Inspiration for your first order
//         </h1>

//         <div className='relative w-full'>
//           {showLeftCate && (
//             <button
//               className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10'
//               onClick={() => scrollHandler(cateScrollRef, 'left')}
//             >
//               <FaChevronCircleLeft />
//             </button>
//           )}

//           <div
//             ref={cateScrollRef}
//             className='flex overflow-x-auto gap-4 pb-2 scroll-smooth'
//           >
//             {categories.map((cat, i) => (
//               <CategoryCard
//                 key={i}
//                 name={cat.category}
//                 image={cat.image}
//               />
//             ))}
//           </div>

//           {showRightCate && (
//             <button
//               className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10'
//               onClick={() => scrollHandler(cateScrollRef, 'right')}
//             >
//               <FaChevronCircleRight />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ================= SHOP SECTION ================= */}
//       <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
//         <h1 className='text-gray-800 text-2xl sm:text-3xl'>
//           Best Shops in {CurrentCity}
//         </h1>

//         <div className='relative w-full'>
//           {showLeftShop && (
//             <button
//               className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10'
//               onClick={() => scrollHandler(shopScrollRef, 'left')}
//             >
//               <FaChevronCircleLeft />
//             </button>
//           )}

//           <div
//             ref={shopScrollRef}
//             className='flex overflow-x-auto gap-4 pb-2 scroll-smooth'
//           >
//             {Array.isArray(ShopsInMyCity) &&
//               ShopsInMyCity.map((shop, i) => (
//                 <CategoryCard
//                   key={i}
//                   name={shop.name}
//                   image={shop.image}
//                 />
//               ))}
//           </div>

//           {showRightShop && (
//             <button
//               className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow z-10'
//               onClick={() => scrollHandler(shopScrollRef, 'right')}
//             >
//               <FaChevronCircleRight />
//             </button>
//           )}
//         </div>
//       </div>

//        {/* ================= product SECTION ================= */}
//        {/* <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
//         <h1 className='text-gray-800 text-2xl sm:text-3xl'>
//           Suggested Food Items
//         </h1>
//         <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center '>
//           {ItemsInMyCity?.map((item,index)=>(
//             <FoodCard key={item._id} data={item} />
//           ))}
//         </div>
//        </div> */}
//     <div className='w-full max-w-6xl flex flex-col gap-5 p-[10px]'>
//   <h1 className='text-gray-800 text-2xl sm:text-3xl'>
//     Suggested Food Items
//   </h1>

//   <div className='w-full flex flex-wrap gap-[20px] justify-center'>
//     {ShopsInMyCity?.flatMap(shop => shop.items || []).map(item => (
//       <FoodCard key={item._id} data={item} />
//     ))}
//   </div>
// </div>

//     </div>
//   )
// }

// export default UserDashboard

// import React, { useEffect, useRef, useState } from 'react'
// import Nav from './Nav'
// import { categories } from '../category.js'
// import CategoryCard from './CategoryCard'
// import { FaChevronCircleLeft } from 'react-icons/fa'
// import { FaChevronCircleRight } from 'react-icons/fa'
// import { useSelector } from 'react-redux'
// const UserDashboard = () => {
//   const { CurrentCity,ShopsInMyCity} = useSelector(state => state.user)
//   const cateScrollRef = useRef()
//   const shopScrollRef = useRef()
//   const [showLeftGetRefButton, setShowLeftGetRefButton] = useState(false)
//   const [showRightGetRefButton, setShowRightGetRefButton] = useState(false)

//   const [showLeftShop, setShowLeftShop] = useState(false)
//   const [showRightShop, setShowRightShop] = useState(false)
//   const updateButton = (ref, setShowLeftButton, setShowRightButton) => {
//     const element = ref.current
//     if (element) {
//       setShowLeftButton(element.scrollLeft > 0)
//       setShowRightButton(
//         element.scrollLeft + element.clientWidth < element.scrollWidth
//       )
//     }
//   }

//   const scrollHandler = (ref, direction) => {
//     if (ref.current) {
//       ref.current.scrollBy({
//         left: direction == 'left' ? -200 : 200,
//         behavior: 'smooth'
//       })
//     }
//   }

//   useEffect(() => {
//     const cateEl = cateScrollRef.current
//     const shopEl = shopScrollRef.current

//     if (!cateEl && !shopEl) return

//     const handleCateScroll = () => {
//       updateButton(
//         cateScrollRef,
//         setShowLeftGetRefButton,
//         setShowRightGetRefButton
//       )
//     }

//     const handleShopScroll = () => {
//       updateButton(shopScrollRef, setShowLeftShop, setShowRightShop)
//     }

//     if (cateEl) {
//       cateEl.addEventListener('scroll', handleCateScroll)
//       handleCateScroll() // initial
//     }

//     if (shopEl) {
//       shopEl.addEventListener('scroll', handleShopScroll)
//       handleShopScroll() // initial
//     }

//     return () => {
//       if (cateEl) cateEl.removeEventListener('scroll', handleCateScroll)
//       if (shopEl) shopEl.removeEventListener('scroll', handleShopScroll)
//     }
//   }, [])

//   return (
//     <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-auto'>
//       <Nav />
//       {/* category */}
//       <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
//         <h1 className='text-gray-800 text-2xl sm:text-3xl'>
//           Inspiration for your first order
//         </h1>

//         <div className='w-full relative'>
//           {showLeftGetRefButton && (
//             <>
//               <button
//                 className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10
// '
//                 onClick={() => scrollHandler(cateScrollRef, 'left')}
//               >
//                 <FaChevronCircleLeft />
//               </button>
//             </>
//           )}
//           <div
//             className='w-full flex overflow-x-auto gap-4 pb-2'
//             ref={cateScrollRef}
//           >
//             {categories.map((cat, index) => (
//               <CategoryCard name={cat.category} image={cat.image} key={index} />
//             ))}
//           </div>
//           {showRightGetRefButton && (
//             <>
//               <button
//                 className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10
// '
//                 onClick={() => scrollHandler(cateScrollRef, 'right')}
//               >
//                 <FaChevronCircleRight />
//               </button>
//             </>
//           )}
//         </div>
//         <div></div>
//       </div>

//       {/* this div for the shop */}
//       <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
//         <h1 className='text-gray-800 text-2xl sm:text-3xl'>
//           Best Shop in {CurrentCity}
//         </h1>
//         <div className='w-full relative'>
//           {showLeftShop && (
//             <>
//               <button
//                 className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10
// '
//                 onClick={() => scrollHandler(shopScrollRef,'left')}
//               >
//                 <FaChevronCircleLeft />
//               </button>
//             </>
//           )}
//           <div
//             className='w-full flex overflow-x-auto gap-4 pb-2'
//             ref={shopScrollRef}
//           >
//             {ShopsInMyCity?.map((shop, index) => (
//               <CategoryCard name={shop.name} image={shop.image} key={index} />
//             ))}
//           </div>
//           {showRightShop && (
//             <>
//               <button
//                 className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10
// '
//                 onClick={() => scrollHandler(shopScrollRef,'right')}
//               >
//                 <FaChevronCircleRight />
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UserDashboard
