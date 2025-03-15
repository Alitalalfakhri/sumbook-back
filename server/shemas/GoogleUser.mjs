import mongoose from 'mongoose';

const GoogleUserSchema = new mongoose.Schema({
  uid:{
    type:String,
    required:true,
    unique:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
  }, 
  displayName:{
    type:String,
    required:true,
  },
  orders:{
    type:Array
  },
  type:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
})

const GoogleUser = mongoose.model('GoogleUser',GoogleUserSchema)

export default GoogleUser;