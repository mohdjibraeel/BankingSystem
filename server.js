require("dotenv").config();
const app =require("./src/app");
const connectToDB=require("./src/config/db");


connectToDB();

const PORT=4000;
app.listen(PORT,()=>{
  console.log(`the server is running at http://localhost:${PORT}`);
})