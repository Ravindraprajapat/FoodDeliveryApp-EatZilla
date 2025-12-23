import React, { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const UseGetCurrentUser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,  // CORRECT position!
        });
        
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log("Error in fetching current user:", error.response?.data);
      }
    };

    fetchUser();
  }, []);

  return null;
};

export default UseGetCurrentUser;
