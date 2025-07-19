import mongoose from "mongoose";

const shapeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  props: { type: Object, required: true },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    shapes: [shapeSchema],
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
