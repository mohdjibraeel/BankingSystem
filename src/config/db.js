const mongoose=require('mongoose');


function connectToDB(){

  mongoose.connect(process.env.MONGO_URI)
  .then(()=>{
    console.log("server id connected to DB")
  })
  .catch((err)=>{
    console.log('Error while connecting to the DB',err);
    process.exit(1);
  })
}

module.exports=connectToDB;