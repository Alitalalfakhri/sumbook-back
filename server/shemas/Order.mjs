import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    itemsArray: {
      type: [
        {
          bookId: { type: String, required: true },
          name:{type:String , require:true},
          quantity: { type: mongoose.Schema.Types.Mixed, required: true }, // Assuming each item has a quantity
        },
      ],
      required: true,
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    date: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    phone: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      required: true,
      
    },
    id: {
      type: String,
      required: true,
     
    },
  },
  { timestamps: true } // Optional: Adds `createdAt` and `updatedAt` fields
);

const Order = mongoose.model("Order", orderSchema);

export default Order;