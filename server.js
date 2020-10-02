const dotenv= require('dotenv');
dotenv.config({path:"./config.env"});
const sequelize= require('./dbConnection');
const createTables= require('./util/createtables');
const syncModels= require('./models/syncmodels');
sequelize.authenticate().then(res=>{
    console.log('Database connected');
}).catch(err=>console.log('Database not connected'));
syncModels().then(res=>{
    console.log('Models Sync done')
})
const app= require('./app');
const Catergory = require('./models/categories.model');
const server=app.listen(process.env.PORT||5000,()=>{
    console.log(`server started on port ${process.env.PORT}`);
})