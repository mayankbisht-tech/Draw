import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
}, { timestamps: true });

const RoomModel = mongoose.model("Room", roomSchema);
export default RoomModel;
