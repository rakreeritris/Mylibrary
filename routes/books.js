const express=require('express');
const router=express.Router();
const Book=require('../models/book');
const Author=require('../models/author');
const imageMimeTypes=['image/jpeg','image/png','image/gif'];
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
router.post('/',async (req,res)=>{
   const book=new Book ({
       title:req.body.title,
       author:req.body.author,
       publishDate:new Date(req.body.date),
       pageCount:req.body.pageCount,
       description:req.body.description,
   })
   saveCover(book,req.body.cover)
   
   try {
       const newBook=await book.save()
       res.redirect(`books/${newBook.id}`)

   } catch (error) {
       renderNewPage(res,book,true)
       console.log('The error is',error);
   }
})

//Show books route
router.get('/:id',async(req,res)=>{
    try {
    const book= await Book.findById(req.params.id).populate('author').exec();
    res.render('books/show',{book:book});
    }
     catch  
     {
      res.redirect('/');  
    }
})

//Edit book route
router.get('/:id/edit',async (req,res)=>{
    try {
        const book=await Book.findById(req.params.id) 
        renderEditPage(res,book) 

    } catch(err)  {
        res.redirect('/');
    }
})

//Update book route
router.put('/:id',async (req,res)=>{
    let book
    
    try {
      book=await Book.findById(req.params.id)
      book.titile=req.body.title
      book.author=req.body.author
      book.publishDate=new Date(req.body.date)
      book.pageCount=req.body.pageCount
      book.description=req.body.description
       if(req.body.cover != null && req.body.cover!=='')
       {
           saveCover(book,req.body.cover)
       }
       await book.save()
       res.redirect(`/books/${book.id}`);
    } catch(err) {
        if(book != null)
        {
            renderEditPage(res,book,true)
        }
        else
        {
            res.redirect('/')
        }
    }
 })

// Delete Book route
router.delete('/:id',async(req,res)=>{
    let book
    try {
        book=await Book.findById(req.params.id)
        await book.remove();
        res.redirect('/books')
    } catch (error) {
        if(book != null)
        {
            res.render('books/show',{
                book:book,
                errorMessage:'could not remove book'
            })
        }
        else
        {
            res.redirect('/')
        }
    }
})

//render new page
async function renderNewPage(res, book, hasError = false) {
     
  renderformPage(res,book,'new')

}


//renderEditPage
async function renderEditPage(res, book, hasError = false) {

    renderformPage(res,book,'edit')
}

//render form fucntion
async function renderformPage(res,book,form,hasError=false)
{
    try {
        const authors= await Author.find({});
        const params={
            authors:authors,
            book:book
        }
        if(hasError)
        {
            if(form === 'edit')
            {
                params.errMessage='Error Updating Book'
            }
            else
            {
                params.errMessage='Error Creating Book'
            }
        }
        res.render(`books/${form}`,params)
  
    } catch (error) {
        res.send(`${error}`);
    }

}


//save Cover function
function saveCover(book,coverEncoded){
    if(coverEncoded == null)
    return
    const cover=JSON.parse(coverEncoded);
    if(cover!=null && imageMimeTypes.includes(cover.type))
    {
        book.coverImage=new Buffer.from(cover.data,'base64');
        book.coverImageType=cover.type
    }
}

module.exports=router