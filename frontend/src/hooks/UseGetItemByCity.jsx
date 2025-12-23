import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice";

const UseGetItemByCity = () => {
     const { CurrentCity } = useSelector(state => state.user)
  const dispatch = useDispatch();
  useEffect(() => {
    if (!CurrentCity) return;
    const fetchItems = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${CurrentCity}`, {
          withCredentials: true,  // CORRECT position!
        });
        
        dispatch(setItemsInMyCity(result.data[0].items))
        console.log(result.data[0].items)
      } catch (error) {
        console.log("Error in fetching current user:", error.response?.data);
      }
    };

    fetchItems();
  }, [CurrentCity]);

  return null;
};



export default UseGetItemByCity;