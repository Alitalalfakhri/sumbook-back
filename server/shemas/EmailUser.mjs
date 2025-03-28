import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid:{
    type:String,
    required:true,
    unique:true,
  },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  orders: {
    type: Array,
    required: true,
  },
  type:{
    type:String,
    required:true,  
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const EmailUser = mongoose.model('EmialUser', userSchema);

export default EmailUser;
