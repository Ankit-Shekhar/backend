import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from Frontend
    // validation: should not be empty
    // check if user already exists: via. username, email
    // check for images, check for avatar
    // upload them on cloudinary
    // create user object - create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response


    const { email, fullName, username, password } = req.body
    console.log("email: ", email);
    if (email === "") {
        throw new ApiError(400, "This field is Mandatory")
    }
    console.log("username: ", username);
    if (username === "") {
        throw new ApiError(400, "This field is Mandatory")
    }
    console.log("fullName: ", fullName);
    if (fullName === "") {
        throw new ApiError(400, "This field is Mandatory")
    }
    console.log("password: ", password);
    if (password === "") {
        throw new ApiError(400, "This field is Mandatory")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select(
        //by default everythink is selected, so the (-ve) represents what not to select
        "-password -refreshToken"
    )


if(!createdUser){
    throw new ApiError(500, "Something went wrong hwile registering the user")
}


return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfuly")
)

})



export { registerUser }