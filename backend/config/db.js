import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("db connected SuccessFully")
    }
    catch (error){
        console.log("Error while connecting to MongoDB", error.message);
    }
}

export default connectDB;