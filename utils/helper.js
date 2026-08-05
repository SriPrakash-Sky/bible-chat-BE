export const sendResponse = (
  res,
  statusCode = 200,
  success = true,
  data = null,
  message = "Success",
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const handleRemoveNull = (results) => {
  return results.map((obj) => {
    for (const key in obj) {
      if (obj[key] === null) {
        obj[key] = "";
      }
    }
  });
};
