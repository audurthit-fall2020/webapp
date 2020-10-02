const dotenv= require('dotenv');
dotenv.config({path:"./config.env"});
const sequelize= require('./dbConnection');
const createTables= require('./util/createtables');
sequelize.authenticate().then(res=>{
    console.log('Database connected');
}).catch(err=>console.log('Database not connected'));
const app= require('./app');
const server=app.listen(process.env.PORT||5000,()=>{
    console.log(`server started on port ${process.env.PORT}`);
})