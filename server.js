const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error')

const colors = require('colors');

const morgan = require('morgan');
// Route files



dotenv.config({path:'./config/config.env'})



connectDB();
const bootcamps = require('./routes/bootcamps')





const PORT = process.env.PORT || 5000;

const app = express();


app.use(express.json());



if(process.env.NODE_ENV === 'development'){
    app.use(morgan((tokens,req,res )=>{
        return [
            tokens.method(req,res),
            tokens.url(req,res),
            tokens.status(req,res)

        ]
    }))
}


app.use('/api/v1/bootcamps',bootcamps);

app.use(errorHandler);

const server = app.listen(PORT , console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error : ${err.message}`.red.italic);
    server.close(()=>process.exit(1));
})