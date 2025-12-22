# Controllers List

This document lists all the controllers implemented in this backend application.

## User Controllers (`src/controllers/user.controllers.js`)

The following controllers are defined in the user controllers module:

1. **registerUser**
   - Handles user registration
   - Validates user input (email, fullName, username, password)
   - Checks for existing users
   - Uploads avatar and cover image to Cloudinary
   - Creates user entry in database

2. **loginUser**
   - Handles user authentication
   - Accepts username or email along with password
   - Verifies credentials
   - Generates access and refresh tokens
   - Sets authentication cookies

3. **logoutUser**
   - Handles user logout
   - Clears refresh token from database
   - Clears authentication cookies

4. **refreshAccessToken**
   - Refreshes expired access tokens
   - Validates refresh token
   - Issues new access and refresh tokens
   - Implements token rotation for security

5. **changeCurrentPassword**
   - Allows authenticated users to change their password
   - Validates old password before updating
   - Saves new password to database

6. **getCurrentUser**
   - Fetches and returns current authenticated user details

7. **updateAccountDetails**
   - Updates user account information
   - Allows modification of fullName and email

8. **updateUserAvatar**
   - Updates user's avatar image
   - Uploads new avatar to Cloudinary
   - Deletes old avatar from Cloudinary

9. **updateUserCoverImage**
   - Updates user's cover image
   - Uploads new cover image to Cloudinary
   - Deletes old cover image from Cloudinary

10. **getUserChannelProfile**
    - Fetches user channel profile information
    - Uses MongoDB aggregation pipeline
    - Calculates subscriber count, channels subscribed to count
    - Determines if current user is subscribed to the channel

## Helper Functions

- **generateAccessAndRefreshTokens** (Internal helper function, not exported)
  - Generates JWT access and refresh tokens
  - Saves refresh token to database
  - Returns both tokens

## Total Count

- **Total Controllers**: 10 exported controller functions
- **Controller Files**: 1 (user.controllers.js)
