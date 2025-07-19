import mongoose from "mongoose";

const shapeSchema = new mongoose.Schema({
  type: { type: String, required: true },  // "rectangle", "circle", etc.
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: false },
  height: { type: Number, required: false },
  color: { type: String, default: "#000000" },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
}, { timestamps: true });

const ShapeModel = mongoose.models.Shape || mongoose.model("Shape", shapeSchema);
export default ShapeModel;
