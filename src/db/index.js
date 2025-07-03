import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
    try {
        const connectionInsance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

        console.log(`Database connected successfully! BD HOST: ${connectionInsance.connection.host}`);
    } catch (error) {
        console.log(`Database connection Failed: ${error}`);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDb
