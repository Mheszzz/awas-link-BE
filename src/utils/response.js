const sendSuccess = (res, statusCode = 200, message, data = undefined) => {
  const responseBody = {
    success: true,
    message,
  };

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
};

const sendError = (res, statusCode = 500, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendError
};
