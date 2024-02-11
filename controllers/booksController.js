const Book = require('../models/bookModel');

// Render a new book from send the HTML form to the client (browser) so that the user can send the data
exports.addBook = async (req, res) => {
    try {
        res.render('./books/bookExchangeAddForm'); 
    } catch (err) {
        res.status(400).render('appError', { title: 'Add new Book', user: req.user, errors: err.errors });
    }
};

// CREATE a new book
exports.createBook = async (req, res) => {
    try {
        const book = new Book({
        title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            exchangeType: req.body.exchangeType,
            owner: req.user._id,  // Assuming req.user contains the authenticated user
            status: req.body.status // Or default to 'available' as per your schema
        });
        const newBook = await book.save();
        res.redirect('/books'); // assuming '/books' is where you list all books
    } catch (err) {
        res.status(400).render('appError', { title: 'Create Book', user: req.user, errors: err.errors });
    }
};

// READ GET all books
exports.getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.render('./books/bookListForm', { title: 'All Books', user: req.user, books });
    } catch (err) {
        res.status(500).render('appError', { message: err.message });
    }
};

// GET a single book by ID
exports.getBookById = async (req, res) => {
    try {
            const book = await Book.findById(req.params.id);
            if (!book) {
                return res.status(404).render('error', { message: 'Book not found' });
            }
            res.render('./books/bookExchangeDetails', { book });
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};


// UPDATE a book by ID
// Render a update book from send the HTML form to the client (browser) so that the user can send the data
exports.updateBookForm = async (req, res) => {
    try {
            const book = await Book.findById(req.params.id);
            console.log('Book ID from params:', req.params.id);  // Step 3

            if (!book) {
                console.log('Book not found');  // Step 5
                return res.status(404).json({ message: 'Book not found' });
            }
            
            console.log('Book found:', book);  // Step 4

            res.render('./books/bookExchangeDetails', {book:book}); 
    } catch (err) {
        res.status(400).render('appError', { title: 'Update Book', user: req.user, errors: err.errors });
    }
};

exports.updateBookById = async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!book) {
        return res.status(404).render("error", { message: "Book not found" });
      }
      const updatedBooks = await Book.find();
      res.render(`./books/bookListForm`, {books: updatedBooks}); // Redirect to book detail page
      //res.redirect(`/books/${req.params.id}`); // Redirect to book detail page
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};

// DELETE a book by ID
exports.deleteBook = async (req, res) => {
    try {
            const book = await Book.findByIdAndRemove(req.params.id);
            if (!book) {
                return res.status(404).render('error', { message: 'Book not found' });
            }
            res.redirect('/books'); // Redirect to all books list
    } catch (err) {
        res.status(500).render('error', { message: err.message });
    }
};
