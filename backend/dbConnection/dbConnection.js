import mongoose from "mongoose";

export const dbConnection = async () => {
    try{
        mongoose.connect(process.env.MONGO_DB_URI);
        console.log("Successfully Connected to Database");
    }
    catch(error){
        console.log("Error Connecting To Database: ", error)
        process.exit(1);
    }
};