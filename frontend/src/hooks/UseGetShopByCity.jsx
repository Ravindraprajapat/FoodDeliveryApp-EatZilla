import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity } from "../redux/userSlice";

const UseGetShopByCity = () => {
  const { CurrentCity } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShops = async () => {
      // 1. Check if CurrentCity exists
      if (!CurrentCity) return;

      try {
        // 2. Trim and Encode (Vns HOSTEL -> Vns%20HOSTEL)
        const cityParam = encodeURIComponent(CurrentCity.trim());
        
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${cityParam}`,
          { withCredentials: true }
        );

        if (result.data) {
          dispatch(setShopInMyCity(result.data));
          console.log("Shops found:", result.data);
        }
      } catch (error) {
        console.error(
          "Error fetching shops:",
          error.response?.data?.message || error.message
        );
        // Error aane par purana data clear kar sakte hain (Optional)
        dispatch(setShopInMyCity([]));
      }
    };

    fetchShops();
  }, [CurrentCity, dispatch]);

  return null;
};

export default UseGetShopByCity;
// import React, { useEffect } from "react";
// import axios from "axios";
// import { serverUrl } from "../App";
// import { useDispatch, useSelector } from "react-redux";
// import { setShopInMyCity } from "../redux/userSlice";

// const UseGetShopByCity = () => {
//      const { CurrentCity } = useSelector(state => state.user)
//   const dispatch = useDispatch();
//   useEffect(() => {
//     const fetchShops = async () => {
//       try {
//         const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${CurrentCity}`, {
//           withCredentials: true,  // CORRECT position!
//         });
        
//         dispatch(setShopInMyCity(result.data))
//         console.log(result.data)
//       } catch (error) {
//         console.log("Error in fetching current user:", error.response?.data);
//       }
//     };

//     fetchShops();
//   }, [CurrentCity]);

//   return null;
// };

// export default UseGetShopByCity;

