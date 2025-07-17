import express from "express"
import mongoose from "mongoose"
import AuthRoutes from "./router/auth"
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();
const app=express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.get("/", (req, res) => {
  res.send("API is running");
});
app.use(express.json());
mongoose.connect(process.env.MONGO_URI as string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}as any).then(()=>{console.log("mongoose connected")})
  .catch((err)=>{console.error("mongoose not connected",err)})
app.use('/api/auth',AuthRoutes);

const port=process.env.PORT||5000;
app.listen(port,()=>{console.log(`the server is running at ${port}`)})