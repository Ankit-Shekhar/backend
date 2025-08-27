import { ApiError } from "../utils/ApiErrors";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

// below we are using req,next but the res is remaining empty, so it can also be written as (req, _, next) this syntax is also correct.
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // getting access of accessToken through cookies and req.header is done for "mobiles" because their we dont have direct access to cookies
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(400, "Unauthorized request")
        }

        // if we get the token then we ask jwt to verify it by providing it the "process.env.ACCESS_TOKEN_SECRET" and store the info in "decodedToken" variable
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        // we get access of _id from decodedToken as while writting access token (generateAccessToken) in user.models.js we added it
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(402, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(402, "Invalid access token")
    }
})