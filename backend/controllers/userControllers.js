import User from "../models/userModel.js";
export const getCurrentUser = async (req , res) =>{
    try{
        const userId = req.userId;
        if(!userId){
            return res.status(400).json({message : "User Id is missing"})
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message : "User not found"})
        }
        return res.status(200).json(user)

    }
    catch(error){
        return res.status(500).json(`Get current user error ${error}`)
    }
}

export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;

    // ✅ validation
    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [lon, lat], // ✅ GeoJSON: [longitude, latitude]
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "location updated" });

  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update user location error: ${error.message}` });
  }
};


// export const updateUserLocation = async (req , res) =>{
//     try {
//         const {lat,lon}=req.body
//         const user = User.findByIdAndUpdate(req.userId,{
//             location:{
//                 type:'Point',
//                 coordinates:[lon,lat]
//             }
//         },{new:true})
//         if(!user){
//             return res.status(404).json({message : "User not found"})
//         }
//         return res.status(200).json({message:'location updated'})
//     } catch (error) {
//         return res.status(500).json(`Update user location error ${error}`)    
//     }
// }
