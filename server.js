const dotenv= require('dotenv');
dotenv.config({path:"./config.env"});
const connection= require('./dbConnection');
const createTables= require('./util/createtables');
connection.connect((err)=>{
    if(err){
        console.log("Database Connection failed");
        return;
    }
    else{
        console.log("Database connection successful");
        createTables.createUserTable().catch(err=>console.log(err.message)).then(()=>{console.log(`Database setup done`)});
    }
})
const app= require('./app');
const server=app.listen(process.env.PORT||5000,()=>{
    console.log(`server started on port ${process.env.PORT}`);
})