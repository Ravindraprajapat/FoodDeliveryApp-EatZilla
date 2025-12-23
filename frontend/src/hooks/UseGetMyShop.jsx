import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

const UseGetMyShop = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector(state => state.user);

  useEffect(() => {
    if (!userData) return;   // 🔥 MOST IMPORTANT FIX

    const fetchShop = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-my`,
          { withCredentials: true }
        );
        dispatch(setMyShopData(result.data));
      } catch (error) {
        console.log(
          "Error in fetching current user:",
          error.response?.data
        );
      }
    };

    fetchShop();
  }, [userData]);

  return null;
};

export default UseGetMyShop;


// import React, { useEffect } from "react";
// import axios from "axios";
// import { serverUrl } from "../App";
// import { useDispatch, useSelector } from "react-redux";

// import { setMyShopData } from "../redux/ownerSlice";

// const UseGetMyShop = () => {
//   const dispatch = useDispatch();
//   const {userData} =useSelector(state=>state.user)
//   useEffect(() => {
//     const fetchShop = async () => {
//       try {
//         const result = await axios.get(`${serverUrl}/api/shop/get-my`, {
//           withCredentials: true,  // CORRECT position!
//         });
//         dispatch(setMyShopData(result.data))
//       } catch (error) {
//         console.log("Error in fetching current user:", error.response?.data);
//       }
//     };

//     fetchShop();
//   }, [userData]);

//   return null;
// };

// export default UseGetMyShop;
