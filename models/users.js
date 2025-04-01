import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  fullName : {type: String, required: true},
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'reader'], default: 'reader' }, 
},
{ timestamps : true,

});
export default mongoose.model('User', UserSchema);