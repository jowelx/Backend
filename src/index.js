require('dotenv').config();
let user = "Joel"
let productId
const express = require('express');
const app = express();
const morgan = require('morgan');
const DB = require('../db/database');
const cors = require('cors');
const multer = require('multer');
const uuid = require('uuid');
const cloudinary = require('cloudinary');
const bcryptjs = require('bcryptjs');
//configuracion del storage
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
})

const session = require('express-session');
//configuracion de las coockies
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  cookie: {
    maxAge: 360000, //10 Hour 000000
  //10 Hour 
  },
  resave: false,
  name: ""
}));
//variable de session del usuario
let name = 'no registrado';
//varable se sseion de administrador
let admin = 'sin sesion';
//settings
app.set('port', process.env.PORT || 4000)
//middlewares
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '500mb' }));
app.use(cors());
app.use(express.urlencoded({ limit: '500mb' }));
//function
let idIMG
let id = Math.random() * 100000000
function uploadFileMultiple() {

  idIMG = id
  const storage = multer.diskStorage({
    destination: './images',
    filename: function (_req, file, cb) {
      var extension = file.originalname.slice(file.originalname.lastIndexOf('.'));
      cb(null, parseInt(id) + uuid.v4() + extension);
    }
  })
  const upload = multer({ storage: storage }).array('image');
  return upload
}
//routes
app.get('/comments/:id',async(req,res)=>{
  let id= req.params
  let comments=[]
  let indice=0
  let coment
  let response
  DB.query('SELECT  * FROM comments WHERE id_product = ?',[id.id],(err,rows)=>{
    rows.forEach(function(field,index){
      DB.query('SELECT  * FROM answer WHERE id_coment = ?',[field.id],(err,fields)=>{
         if(err){
           console.log(err)
         }else{
        coment = field
        response = fields
        comments.push({coment,response})     
          indice +=1
          if(indice === rows.length){
            res.json(comments)
          }
        }
    })
  })
})
})
//notificacion de comentarios
app.post('/updateComments/:id',async(req,res)=>{
  let id= req.params
  let comments=[]
  let indice=0
  let coment
  let response
  let com =0

  DB.query("UPDATE products SET comments = '"+ com+ "'WHERE id = " +id.id,(err,rows)=>{
    if(err){
      console.log(err)
    }else{
      console.log("puta notificacion")
      DB.query('SELECT  * FROM comments WHERE id_product = ?',[id.id],(err,rows)=>{
   if(rows.length >0){
        rows.forEach(function(field,index){
          DB.query('SELECT  * FROM answer WHERE id_coment = ?',[field.id],(err,fields)=>{
             if(err){
    
               console.log(err)
             }else{
            coment = field
            response = fields
            comments.push({coment,response})
         
              indice +=1
            
              if(indice === rows.length){
                console.log("puta notificacion x2")
                console.log(comments)
                res.json(comments)
           
              }
            }
        })
      })
    }else{
      res.send("undefined")
    }})
  
    }
  
    }
  )//

})
//cargar todos los productos
app.get('/', (req, res) => {
  DB.query('SELECT * FROM products', (err, rows, fields) => {
    if (!err) {

 
     
      res.json( rows);



    } else {
      console.log(err)
    }
  })

})
//cargar un producto en concreto
app.get('/product/:id', (req, res) => {

  let product = req.params
  let result = []
  let productInfo
  let imagenes
  console.log(product.id)
  DB.query('SELECT * FROM products WHERE id =' + [product.id], (err, rows, fields) => {
    productInfo = rows
      result.push({ productInfo })
      res.json(result)
      console.log(result)
    
  })
})
//cargar usuario logeado
app.get('/user', (req, res) => {
  res.json(user)
})
//productos que el usuario agrego al carrito
app.get('/cart', (req, res) => {

  let cart = 0
  let like = 0
  let products = []
  let indice = 0

  DB.query('SELECT * FROM shopping_cart WHERE user = ?', [user], (err, result) => {
    if (err) {
      console.log(err)
    }
    else {
      result.forEach(function (file, index) {
        DB.query('SELECT * FROM products WHERE id = ?', [file.id_product], (err, results) => {
          indice += 1
          
          products.push({
            results,
            amount: file.amount
          })
          if (indice === result.length) {

            res.json(products)

          }
        })

      })

    }
  })
})
//ruta para cargar las novedades
app.get('/news',(req,res)=>{
  DB.query('SELECT * FROM news',async(err,result)=>{

    if(err){
      console.log(err)
    }

  
    else{
      console.log(result)
      res.json(result)
  }
  })
})
//gerstion de respuestas
app.post('/answers',async(req,res)=>{
 
  let values ={
    id_coment:req.body.data.id_comment,
    comment:req.body.data.comment,
    user:user
  }
  console.log(values)
 DB.query('INSERT INTO answer SET  ?',values,async(err,result)=>{
if(err){
  console.log(err)
}else{
  res.send("ok")
}
  })
   
})
//ruta de pruebas
app.get('/prueba', uploadFileMultiple(), async (req, res) => {

  DB.query('SELECT comments FROM products WHERE id ='+ 58,async(err,fields)=>{
console.log(fields[0].comments)
  })
  //cloudinary.v2.uploader.upload(req.body.file, function (error, result){console.log(result)
  //})
})
//publicar novedades
app.post('/news',uploadFileMultiple(),async(req,res)=>{
  let files = req.body.file
  let indice = 0
  let values={}
  console.log(files)

  DB.query('SELECT * FROM news',async(err,result)=>{
if(result.length>0){
  DB.query("DELETE FROM news ", async(err, results) => {
    if (err) {
      console.log(err)
    }
    else {
      await files.forEach(function (file, index) {
        cloudinary.v2.uploader.upload(file.url, function (error, result) {
          if(error){
            console.log(error)
          }else{
            indice += 1
            values ={url: result.url}
            DB.query('INSERT INTO news SET  ?',values,async(err,result)=>{
    if(err){
      console.log(err)
    }
            })
            if(indice === files.length){
              res.send("ok")
            }
         
          }
        })
      
      })
    }
  }) 
}else{
  await files.forEach(function (file, index) {
    cloudinary.v2.uploader.upload(file.url, function (error, result) {
      if(error){
        console.log(error)
      }else{
        indice += 1
        values ={url: result.url}
        DB.query('INSERT INTO news SET  ?',values,async(err,result)=>{
if(err){
  console.log(err)
}
        })
        if(indice === files.length){
          res.send("ok")
        }
     
      }
    })
  
  })
}

  })

})
//publicar producto
app.post('/upload', uploadFileMultiple(), async (req, res) => {
  console.log(req.body.data)
  id = Math.random() * 100000000000
  let indice = 0
  let files = req.body.file
  let name_product = req.body.data.name_product
  let description_product = req.body.data.description
  let price = req.body.data.price
  let year = req.body.data.year
  let model = req.body.data.model
  let state = req.body.data.state
  let brand = req.body.data.brand
  let amount = req.body.data.amount
  let category = req.body.data.category
  console.log(files)

  await files.forEach(function (file, index) {
    cloudinary.v2.uploader.upload(file.path,{timeout:12000000} , (error, result)=> {
      if (error) {
        console.log(error)
      }
      else {
            console.log(result)
            Msqlinsert('products', {
              product_name: name_product,
              description_product: description_product,
              id_images_product: parseInt(id),
              price: price,
              year: year,
              model: model,
              state: state,
              brand: brand,
              amount: amount,
              category:category,
              portada: result.url
            })
            res.send("ok")
            indice = 0

          }});

  })
  //MsqlInsert(images, )

})
//agregar comentarios
app.post('/comments',async(req,res)=>{


  console.log("id del producto a comentar"+req.body.data.id_product)
  let com = 0
  let values ={
    user :req.body.data.user,
    id_product:req.body.data.id_product,
    comment:req.body.data.comments,
    revised: "false"
  }
  if(user == "admin"){
    DB.query('INSERT INTO comments SET ?', values, async (err, results) => {
      res.send("ok")
        })
  }else{
  DB.query('SELECT comments FROM products WHERE id ='+values.id_product,async(err,fields)=>{
   
    com =fields[0].comments +1
    DB.query("UPDATE products SET comments = '"+ com + "'WHERE id = '" + values.id_product+"'",(err,rows)=>{
if(err){
  console.log(err)
}else{ 
  DB.query('INSERT INTO comments SET ?', values, async (err, results) => {
    res.send("ok")
      })
}
    

    })
  })
}
})
///countComents
app.get('/countComents',async(req,res)=>{
  let count =0
  let indice=0
  DB.query('SELECT comments FROM products',async(err,fields)=>{
  
   fields.forEach(function(item){
     indice +=1

count+= item.comments
console.log(count)
if(indice === fields.length){
  res.json(count)
}

   })
      })
})
//restablecer contraseña
app.post('/restore',async(req,res)=>{
  let pass = req.body.pass
  let email = req.body.email
  let password = await bcryptjs.hash(pass, 12)
  console.log(email)
  DB.query('SELECT * FROM users WHERE mail =? ',[email],(err,rows)=>{
  let User = rows[0].user
  DB.query("UPDATE users SET password = '"+ password + "'WHERE user = '" + User+"'",(err,rows)=>{
    if(err){
   console.log(err)
    }else{
     res.send("ok")
    }
    })
  })

})
//verificar correo
app.post('/verifyEmail',async(req,res)=>{
  let email = req.body.email
  console.log(email)
 DB.query('SELECT * FROM users WHERE mail =? ',[email],(err,rows)=>{
   if(err){
     console.log(err);
   }else if(rows.length > 0){
res.send("ok")
   }else if(rows.length === 0){
    res.send("undefined")
       }
 })
})
//registrar usuario
app.post('/register', async (req, res) => {
  const mail = req.body.mail;
  const pass = req.body.password;
  const user = req.body.user;
  const name_user = req.body.name
  let password = await bcryptjs.hash(pass, 12)
  const values = {
    name: name_user,
    user: user,
    password: password,
    mail: mail,
    type: "client"
  }
  DB.query('SELECT * FROM users WHERE mail = ?', [mail], (err, rows, fields) => {
    if (rows.length > 0) {
      res.send("correo")
    } else {
      DB.query('SELECT * FROM users WHERE user = ?', [user], (err, rows, fields) => {
        if (rows.length > 0) {
          res.send("user")
        } else {
          res.send("succes")
          DB.query('INSERT INTO users SET ?', values), async (err, results) => {




          }
        }

      })
    }

  })
})
//borrar producto
app.post('/delete/:id', async (req, res) => {
  let product = req.params
  DB.query("DELETE FROM products WHERE id = ?", [product.id], (err, results) => {
    if (!err) {
      res.send('ok')
    }
    else (
      console.log(err)
    )
  })
})
//borrar producto de la lista del usuario
app.post('/deleteCart/:id', async (req, res) => {
  let product = req.params
  DB.query("DELETE FROM shopping_cart WHERE id_product = ?", [product.id], (err, results) => {
    if (!err) {
      res.send('ok')
    }
  
    else (
      console.log(err)
    )
  })
})
//guardar los productos que el usuario añade al carrito
app.post('/cart', async (req, res) => {
  let values = {
    id_product: req.body.id,
    amount: req.body.amount,
    user: req.body.user
  }
  let amount_stock
  let amount 
  DB.query('SELECT * FROM products WHERE id = ?',[req.body.id],(err,row)=>{
     amount_stock = row[0].amount
  DB.query('SELECT * FROM shopping_cart WHERE id_product = ?',[req.body.id],(err,row)=>{
    if(row.length > 0){
      console.log("este producto si existe")
    amount = row[0].amount + req.body.amount
    if(amount > amount_stock){
    amount = amount_stock
} DB.query("UPDATE shopping_cart SET amount = '" + amount + "' WHERE id_product = " + req.body.id, async (err, result) => {
     res.send("ok")
      })
    }else{
      DB.query('INSERT INTO shopping_cart SET ?', [values], (err, result) => {

        if (err) {
          console.log(err)
        } else {
          res.send("ok")
        }
      })
    }
  })
})
})
//actualizar productos
app.post('/update/:id', async (req, res) => {
  console.log(req.body)
  let file = req.body.file[0].portada
  console.log(file)
  let id = req.params.id
    product_name = req.body.data.name_product,
    description_product = req.body.data.description,
    price = req.body.data.price,
    year = req.body.data.year,
    model = req.body.data.model,
    state = req.body.data.state,
    brand = req.body.data.brand,
    amount = req.body.data.amount,
    category = req.body.data.category
    cloudinary.v2.uploader.upload(file, function (error, results) {
      DB.query("UPDATE products SET product_name = '" + product_name + "', description_product ='" + description_product + "', price ='" + price + "', year ='" + year + "', model ='" + model + "', state ='" + state + "', brand ='" + brand + "', amount ='" + amount + "',category ='"+category+"' , portada ='" + results.url + "' WHERE id = " + id, async (err, result) => {
        if (err) {
          console.log(err)
          console.log(req.params)
        } else {
          res.send('ok')
        }
      })
    })
})
//indica cuantos comentarios hay en cada producto
app.post('/notification/:id',async(req,res)=>{
  console.log(req.params.id)
})
//inicio de session
app.post('/login', async (req, res) => {
  let mail = req.body.user
  let pass = req.body.password
  let password = await bcryptjs.hash(pass, 12)
  DB.query('SELECT * FROM users WHERE mail = ?', [mail], async (err, rows, fields) => {
    //se comprueba el usuario
    if (rows.length == 0) {
      res.send("user");
    }
    //se comprueba la contraseña
    else if (!(await bcryptjs.compare(pass, rows[0].password))) {
      res.send("pass");
    } else {
      req.session.loggedin = true;
      req.session.name = rows[0].user;
      user = req.session.name
      res.send({ type: "succesClient", user: user })
    }
  })
});

//cerrar session
app.post('/loguot',(req,res)=>{
user ="";
})
function Msqlinsert(TABLE, VALUES) {
  return new Promise((resolve, reject) => {

    DB.query('INSERT INTO ' + [TABLE] + ' SET ?', VALUES), (err, results) => {
      //const result = await 
      if (err) {
        console.log(err)
        return reject(err)
      }
      return resolve(4545)




    }

  })
}
app.use(function (req, res, next) {
  if (!req.user)
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});
//starting the server
app.listen(app.get('port'), () => {
  console.log('server on port ' + app.get('port'));
})