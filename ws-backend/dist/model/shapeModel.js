"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const shapeSchema = new mongoose_1.default.Schema({
    type: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: false },
    height: { type: Number, required: false },
    color: { type: String, default: "#000000" },
    roomId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Room", required: true },
}, { timestamps: true });
const ShapeModel = mongoose_1.default.models.Shape || mongoose_1.default.model("Shape", shapeSchema);
exports.default = ShapeModel;
