import express from "express";
import Bootstrap from "./src/Bootstrap.js";
import 'dotenv/config'
const app = express();

Bootstrap(app, express);
