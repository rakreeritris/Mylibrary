const express=require('express');
const router=express.Router();
const Book=require('../models/book');
const Author=require('../models/author');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
const uploadPath=path.join('public',Book.coverImageBasePath)
const imageMimeTypes=['image/jpeg','image/png','image/gif']

const upload=multer({
    dest:uploadPath,
    fileFilter:(req,file,callback)=>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

//All books route
router.get('/',async (req,res)=>{
let query=Book.find();
if(req.query.title != null && req.query.title!=' ')
{
    query=query.regex('title',new RegExp(req.query.title,'i'));
}
if(req.query.publishedBefore != null && req.query.publishedBefore!=' ')
{
    query=query.lte('publishDate',req.query.publishedBefore);
}
if(req.query.publishedAfter != null && req.query.publishedAfter!=' ')
{
    query=query.gte('publishDate',req.query.publishedAfter);
}
console.log(req.query);
   try {
       const books= await Book.find({})
       res.render('books/index',{
           books:books,
           searchOptions:req.query
       })
   } catch (error) {
       res.redirect('/')
   }
})

//new books route
router.get('/new', (req,res)=>{
  
        renderNewPage(res,new Book())
})

//create books route
router.post('/',upload.single('cover'),async (req,res)=>{
    const fileName=req.file != null ?req.file.filename:null
   const book=new Book ({
       title:req.body.title,
       author:req.body.author,
       publishDate:new Date(req.body.date),
       pageCount:req.body.pageCount,
       coverImageName:fileName,
       description:req.body.description,
   })

   try {
       const newBook=await book.save()
       res.redirect('books');
       console.log(newBook)

   } catch (error) {
       if(book.coverImageName!=null)
       {
           removeBookCover(book.coverImageName)
       }
       renderNewPage(res,book,true)
       console.log('The error is',error);
   }
})

function removeBookCover(filename){
    fs.unlink(path.join(uploadPath,filename),err=>{
        if(err)
        console.error(err);
    })
}
async function renderNewPage(res, book, hasError = false) {
     
    try {
        const authors= await Author.find({});
        const params={
            authors:authors,
            book:book
        }
        if(hasError)
        params.errMessage='Error Creating Book'
        res.render('books/new',params)
  
    } catch (error) {
        res.send(`${error}`);
    }

}

module.exports=router