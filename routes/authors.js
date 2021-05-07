const express=require('express');
const Book = require('../models/book');
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



router.post('/',async (req,res)=>{
  const author=new Author({
    name:req.body.name
  })
  try {
    const newAuthor=await author.save()
    res.redirect(`authors/${newAuthor.id}`)
  } catch  {
    res.render('authors/name',{
      author:author,
      errorMessage:'Error creating Author'
    })
  }
})


router.get('/:id',async (req,res)=>{
  try {
    const author=await Author.findById(req.params.id)
    const books=await Book.find({author:author.id}).limit(6).exec();
    res.render('authors/show',{
      author:author,
      booksByAuthor:books
    })
  } catch(err)  {
    console.log(err)
    res.redirect('/');
  }
})

router.get('/:id/edit',async (req,res)=>{
  try {
    const author=await Author.findById(req.params.id)
    res.render('authors/edit',{author:author})
  } catch (error) {
    res.redirect('/authors')
  }
})
router.put('/:id',async (req,res)=>{
  let author
  try {
    author=await Author.findById(req.params.id) 
    author.name=req.body.name 
    await author.save()
    res.redirect(`/authors/${author.id}`)
  } catch {
     if(author == null)
     {
       res.redirect('/')
     }
     else
     {
    res.redirect(`authors/new`,{
      author:author,
      errorMessage:'Error updating Author'
    })
     }
  }
})

router.delete('/:id',async (req,res)=>{
  let author
  try {
    author=await Author.findById(req.params.id) 
    await author.remove()
    res.redirect(`/authors`)
  } catch {
     if(author == null)
     {
       res.redirect('/')
     }
     else
     {
    res.redirect(`/authors/${author.id}`)
     }
  }
 
})

module.exports=router