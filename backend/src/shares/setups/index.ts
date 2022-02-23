require("isomorphic-fetch");
import { config } from "dotenv";
config();
import "reflect-metadata";
import { connectMongo } from "./connect-mongo";
connectMongo();
