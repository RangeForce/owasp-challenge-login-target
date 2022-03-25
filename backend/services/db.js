const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/myapp", {useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log("connected to DB");
})

const UserSchema = new mongoose.Schema({
    username: {
      type: String, 
      required: true
    },
    password: {
      type: String, 
      required: true
    },
    role: {
      type: String, 
      required: true
    },
});

const User = mongoose.model("User", UserSchema);


async function get_user(username, password) {
  const user = await User.findOne({username, password});
  return user;
}

module.exports = { get_user };
