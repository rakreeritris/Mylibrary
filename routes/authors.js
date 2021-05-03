const express=require('express');
const router=express.Router();
const Author=require('../models/author');

//All authors route
router.get('/',async (req,res)=>{
  let searchOptions={}
  if(req.query.name !=null && req.query.name!=='')
  {
    searchOptions.name=new RegExp(req.query.name,'i')
  }

  const author=await Author.find(searchOptions);
  res.render('authors/index',{authors:author,
  searchOptions:req.query});
})

router.get('/new',(req,res)=>{
    res.render('authors/new',{author:new Author});
})

router.post('/',(req,res)=>{
  const author=new Author({
    name:req.body.name
  })
  author.save((err,newAuth)=>{
    if(err)
    {
    let locals={author:author,errorMessage:'something went wrong'}
    res.render('authors/new',locals)
    }
   else{  
    res.redirect('authors')
     }
  })
})

module.exports=router