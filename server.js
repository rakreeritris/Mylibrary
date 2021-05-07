if(process.env.NODE_ENV!=='production')
{
    require('dotenv').config();
}  
//Importing Modules
const express=require('express');

const app=express();
const expressLayouts=require('express-ejs-layouts');
const mongoose=require('mongoose');
const methodOverride=require('method-override');

//Importing Routes
const indexRouter=require('./routes/index');
const authorRouter=require('./routes/authors');
const bookRouter=require('./routes/books');

app.set('view engine','ejs');
app.set('views',__dirname+'/views');
app.set('layout','layouts/layout'); 
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({    
    extended:true
}));
app.use(express.json());
app.use('/',indexRouter);
app.use('/authors',authorRouter);
app.use('/books',bookRouter);
//Mongoose connection

mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true,useUnifiedTopology: true})
const  db=mongoose.connection
db.on('error',error=>console.error(error))
db.once('open',()=>
    console.log('Connected to Mongoose')
);
// setting up PORT
app.listen(process.env.PORT||3000);  

   


  
  