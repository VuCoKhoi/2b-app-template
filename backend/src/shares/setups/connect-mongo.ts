const mongoose = require("mongoose");

const uri = {
  production: process.env.MONGODB_URI,
  development: process.env.MONGODB_URI_LOCAL,
};

const env = process.env.NODE_ENV || "development";

export function connectMongo() {
  mongoose
    .connect((uri as any)[env], {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("[MongoDB] Connect successfully! \n"))
    .catch((err: any) => {
      throw err;
    });
}
