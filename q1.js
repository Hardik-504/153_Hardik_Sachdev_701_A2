const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));//This line helps Express to read data from HTML forms (like username, email, etc.).
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.PNG' && ext !== '.jpg' && ext !== '.jpeg') {
      return cb(new Error('Only images allowed (.jpg, .jpeg, .png)'));
    }
    cb(null, true);
  }
}).fields([
  { name: 'txtpic', maxCount: 1 },
  { name: 'txtpics', maxCount: 5 }
]);


app.get('/', (req, res) => {
  res.render('form', { errors: {}, old: {} });
});


app.post('/register', 
  (req, res, next) => upload(req, res, function(err) {
    if (err instanceof multer.MulterError || err) {
      req.fileError = err.message;
    }
    next();
  }),
  [
    body('txtuname').notEmpty().withMessage('Username is required'),
    body('txtemail').isEmail().withMessage('Valid email required'),
    body('txtpassword').isLength({ min: 5 }).withMessage('Password must be at least 5 chars'),
    body('txtcpassword').custom((value, { req }) => value === req.body.txtpassword).withMessage('Passwords must match'),
    body('txtgen').notEmpty().withMessage('Gender is required'),
     body('txthob').custom((value, { req }) => {
      if (!req.body.txthob) {
        throw new Error('At least one hobby must be selected');
      }
      return true;
    })
   
  ], (req, res) => {
    const errors = validationResult(req);
    const fileErrors = {};

    if (req.fileError) {
      fileErrors.file = { msg: req.fileError };
    }
    if (!req.files || !req.files.txtpic) {
      fileErrors.txtpic = { msg: 'Profile picture is required' };
    }
    if (!req.files || !req.files.txtpics || req.files.txtpics.length === 0) {
      fileErrors.txtpics = { msg: 'At least one other picture is required' };
    }

    if (!errors.isEmpty() || Object.keys(fileErrors).length > 0) {
      return res.render('form', {
        errors: { ...errors.mapped(), ...fileErrors },
        old: req.body
      });
    }

    const data = {
      username: req.body.txtuname,
      email: req.body.txtemail,
      gender: req.body.txtgen,
      hobbies: Array.isArray(req.body.txthob) ? req.body.txthob : [req.body.txthob],
      profilePic: req.files.txtpic ? req.files.txtpic[0].filename : '',
      otherPics: req.files.txtpics ? req.files.txtpics.map(f => f.filename) : []
    };

    const timestamp = Date.now();
    const downloadFileName = `user_${timestamp}.txt`;
    const downloadFilePath = path.join(__dirname, 'public', 'uploads', downloadFileName);

    const content = `User Info:\n${JSON.stringify(data, null, 2)}`;
    fs.writeFileSync(downloadFilePath, content);

    res.render('success', {
      data,
      downloadFileName: `uploads/${downloadFileName}`
    });
  }
);

app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.query.file);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send("File not found.");
    }
  });
});

app.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
});
