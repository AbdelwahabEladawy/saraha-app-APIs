export const successHandler = ({
  res,
  message = "Done",
  data = {},
  status = 200,
}) => {
  res.status(status).json({ message, data ,status });
};
