import mongoose from "mongoose";

const ConnectDB = async () => {
  await mongoose
    .connect(process.env.URI)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.log("Database connection failed", err);
    });
};

export default ConnectDB;
