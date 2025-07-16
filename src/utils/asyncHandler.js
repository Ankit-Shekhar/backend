
//try catch method
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (err) {
//     console.error(err);
//     res.status(err.code || 500).json({
//        success: false,
//        message: err.message || 'An error occurred'
//     });
//   }
// }

// export default asyncHandler;


//Promise method
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err));
  }
}
export { asyncHandler }