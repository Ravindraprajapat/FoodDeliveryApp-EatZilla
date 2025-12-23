
import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";

import { } from "../redux/ownerSlice";
import { setMyOrders } from "../redux/userSlice";

const UseGetMyOrders = () => {
  const dispatch = useDispatch();
  const {userData} =useSelector(state=>state.user)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,  // CORRECT position!
        });
        dispatch(setMyOrders(result.data))
        console.log(result.data)
      } catch (error) {
        console.log("Error in fetching current user:", error.response?.data);
      }
    };

    fetchOrders();
  }, [userData]);

  return null;
};

export default UseGetMyOrders;


