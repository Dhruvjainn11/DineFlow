// server/models/Table.js
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    qrCode: { type: String },
    status: {
      type: String,
      enum: ["Available", "Occupied"],
      default: "Available",
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Table = mongoose.model("Table", tableSchema);
export default Table;
