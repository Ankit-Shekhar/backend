import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


// writing "generateAccessAndRefreshTokens" function to generate them and use below 
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        //finding the user in DB on the basis of "userId" and generating access and refresh token
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //saving refresh token in Db, when we try to save it in DB using "user" and not mongoose "User" then mongoose user model kicks in(password field) so to stop that we add "{validateBeforeSave: false}" to stop validating anything else.
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // after saving to DB return it.
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // LOGIC :: THAT HAS TO BE EXECUTED.

    // get user details from Frontend
    // validation: should not be empty
    // check if user already exists: via. username, email
    // check for coverimages, check for avatar because avatar is mandatory to give here.
    // upload them on cloudinary
    // create user object - create entry in DB (because mongoDb is a noSql type db so there mostly data is passed in form of objects)
    // remove password and refresh token field from response (because the returned response will have passwords and refresh tokens as well in it, it actually returns all the data that we pass to it, so we remove the above mentioned fields from it and then show it to the user.)
    // check for user creation (final check that user was created successfully or not, wheather the response had any value or was null?)
    // return response

    // Debug: Check what we're receiving
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("Content-Type:", req.headers['content-type']);


    // { email, fullName, username, password } these are the data fields that we will recieve from user from the "body" thats why we used "req.body" 
    const { email, fullName, username, password } = req.body || {};
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

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists")
    }

    // local path of avatar stored in our local storage (server). Here putting '?' because maybe for any reason we may not have access to files and avatar as there are multiple files being uploaded and [0]index of avatar returns an object, so it is possible that for some reason it may not return that object.
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // both the above cases will create a problem that if we didnt uploaded any one of the required then also the will try to access the data on the [0] index of avatar and coverImage which then will be undefined and then it will throw this error "TypeError: Cannot read properties of undefined (reading '0')" and not our custom error which says that "this file is required". So, better way is to check them using a 'if' condition which is done below.

    //if we didnt uploaded coverImg and did'nt even check its local path then it can throw an error, so to resolve it we ::

    let coverImageLocalPath;

    // here we check 
    // 1. are we getting files from body or not
    // 2. the returning array has coverImage or not
    // 3. the returned coverImage has any properties or not
    // if all of these are true then its proved that we recieved the "coverImageLocalPath" and we can extract its path from their.
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // uploaded avater and coverImage to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // First check if avatar is successfully uploaded or not? if avatar is not successfully uploaded then give a error otherwise it will create an error in DB because avatar is mandatory to upload.
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        // creating a check for "coverImage" that if it has been successfully uploaded then upload its url , if not then let it remain empty as its not mandatory to upload "coverImage".
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // checking if "user" is successfully created or not, if not then throw an error , if created then remove the password and refresh token from the response and then return the response to user.
    const createdUser = await User.findById(user._id).select(
        //by default everythink is selected, so the (-ve) represents what not to select
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // returning the response::
    return res.status(201).json(
        // creating an object of "ApiResponse" utility that we made and passing the parameters that we need as response ::
        // new ApiResponse -> object of ApiResponse class (statusCode, Data, "Message")
        new ApiResponse(200, createdUser, "User registered Successfuly")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    // LOGIC :: THAT HAS TO BE EXECUTED.

    // 1. get data from "req.body"
    // 2. on base of what we will find the user : username or email -> write a code for that
    // 3. find the user
    // 4. password check
    // 5. if correct password is given then generate "Access Token" & "Refresh Token"
    // 6. send  "Access Token" & "Refresh Token" to user through "Cookies"
    // 7. give response (loged in)


    //get data from frontend
    const { email, username, password } = req.body

    //we can login on base of anyone : "username" or "email", if thats the case remove the other one from condition, here we are checking if both are not their then return error.
    if (!username || !email) {
        throw new ApiError(400, "username and email with password is required")
    }

    //if we successfully got "username" or "email" then check if they already exist in DB
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    // if we found the user then he will give password , so check if provided password is correct or not?
    //we have already made a method "isPasswordCorrect" using "userSchema.methods" in user.models.js so we will use that
    // the below provided password is comming from the logging in user form req.body
    const isPasswordValid = await user.isPasswordCorrect(password) // this will return true / false

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid User Credentials")
    }

    // taking "accessToken, refreshToken" from the function "generateAccessAndRefreshTokens" as it returns that 
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // once again getting all the data of the user and saving it in "loggedInUser" accept these "-password -refreshToken"
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // sending Cookies: to do so we need to enable some options
    // byDefault cookies can be modified in frontend, these 2 options make the cookies "readable and modifiable" only by the server and not in the frontend
    const options = {
        httpOnly: true,
        secure: true
    }

    // once options are set return response with cookies with options enabled in it.
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )
})


const logoutUser = asyncHandler(async (req, res) => {
    // we cant directly access the User here, because in cases above we were taking "{ email, fullName, username, password } = req.body" all these info from user on basis of what we were finding user in DB, but in "logoutUser" we dont ask user to enter all these details, so currently we dont have access to the user, so here we use Middleware.


    // why can i access "req.user" here because before comming to this functin we are running a "verifyJWT" middleware which is saving all the details of the user using "User" from mongoose to "req.user"

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                // deleting refreshToken from Db
                refreshToken: undefined
            }
        },
        {
            // by passing "new: true" we say that when returning , return the new updated value.
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Refresh Token is being sent with the request
    const incomingRefreshToken = req.cookie.accessToken || req.body.accessToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }


    // verify the incoming refresh token with the one saved in our DB
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // getting all the details of the user through its id found by unwrapping "decodedToken"
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token has expired or used")
        }

        // generate new access and refresh token to the user
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .josn(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh token")
    }

})

export { registerUser, loginUser, logoutUser,refreshAccessToken } 