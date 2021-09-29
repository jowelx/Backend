require('dotenv').config();
let user = ""
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
cloudinary.config({
    cloud_name:'dfaaqkh9d',
    api_key:'932154441455112',
    api_secret:'zilTZZg1lFFju8rEOK7tYfKeBvo',
    secure: true
})
const session = require('express-session');
app.use(session({
	secret: 'secret',
  cookie: { 
    maxAge : new Date(Date.now() + 36000000), //10 Hour 
    expires : new Date(Date.now() + 36000000), //10 
   },
	resave: false,
	saveUninitialized: false,
  name:""
}));
//variable de session del usuario
let name = 'no registrado';
//varable se sseion de administrador
let admin = 'sin sesion';
//settings
app.set('port', process.env.PORT || 4000)
//middlewares
app.use(morgan('dev'))
app.use(express.urlencoded({extended:true}));
//app.use(express.json());
app.use(express.json({limit: '500mb'}));
app.use(cors());
app.use(express.urlencoded({limit: '500mb'}));
//function
let idIMG
let id = Math.random()*100000000
function uploadFileMultiple(){
 
    idIMG = id
    const storage = multer.diskStorage({
        destination:'./images',
        filename:function(_req,file,cb){
            var extension = file.originalname.slice(file.originalname.lastIndexOf('.'));
            cb(null,parseInt(id)+ uuid.v4() + extension);
        }
    })

 const upload = multer({storage:storage}).array('file');
return upload
}

//routes
app.get('/',(req,res)=>{
   DB.query('SELECT * FROM products',(err,rows,fields)=>{
  if(!err){
      
      let count =0
      let indice = 0
      let products_lentgh = rows
      const products = []
      products_lentgh.forEach(function(file){
        DB.query('SELECT * FROM images WHERE Id_product = '+[file.id_images_product],(err,rows,fields)=>{
            if(err){ console.log(err)}
           
          
            count += 1
           let images_url  = []
           let images = rows
           images.forEach(function(image){
            indice +=1
            if(indice==1){
                let url = image.URL
                products.push(
                    {file, url}
                    
                )
      
            }if(indice == images.length){
                indice = 0
             } 
          

           })

            if(count == products_lentgh.length){
                res.json(products);
                } 
        });

      })

    
     
   }else{
       console.log(err)
   }
})

})
app.get('/product/:id',(req,res)=>{
  
       let product = req.params
       let result =[]
       let productInfo
       let imagenes
      console.log(product.id)
     DB.query('SELECT * FROM products WHERE id ='+ [product.id],(err,rows,fields)=>{
        productInfo = rows
        DB.query('SELECT * FROM images WHERE Id_product = '+ [productInfo[0].id_images_product],(err,roows,fields)=>{
        imagenes= roows
        result.push({ productInfo ,imagenes} )
        res.json(result)
        console.log(result)
        })
       })
     })
app.get('/user',(req,res)=>{
  res.json(user)

})

 function  Msqlinsert(TABLE, VALUES){
   return new Promise((resolve,reject)=>{
     
   DB.query('INSERT INTO '+ [TABLE] + ' SET ?', VALUES), (err,results )=>{
        //const result = await 
        if(err){
           console.log(err)
           return reject(err)
         }
          return resolve(4545)
          
         
         
     
     }
    
   })
 }
 app.post('/prueba',async(req,res)=>{
  const result=Msqlinsert('prueba', {xd :"4444444444444"})
  console.log(result)
 })
app.post('/upload',uploadFileMultiple(),async(req,res)=>{
    console.log(req.body.data)

    
     id = Math.random()*100000000000
        let indice =0
        let files = req.body.file
        let name_product = req.body.data.name_product
        let description_product = req.body.data.description
        let price = req.body.data.price
        let year =req.body.data.year
        let model = req.body.data.model
        let state = req.body.data.state
        let brand = req.body.data.brand
        let amount =req.body.data.amount
        console.log(files)
        let  img_principal = req.body.portada
        let portada
          await files.forEach(function(file, index){
            cloudinary.v2.uploader.upload(file.path, function (error, result){
               if(error){
                console.log( error)
               }
              else{
                indice += 1
                Msqlinsert('images' ,{url:result.url,
                  Id_product:parseInt(id)
                 })
                if(indice == files.length){
                cloudinary.v2.uploader.upload(img_principal, function (error, results){
            
              console.log(result)
            
                    Msqlinsert('products' ,{
                      product_name:name_product,
                        description_product:description_product,
                        id_images_product: parseInt(id),
                        price:price,
                        year:year,
                        model:model,
                        year:year,
                        state:state,
                        brand:brand,
                        amount:amount,
                        portada: results.url
                       })
                       res.send("ok")
                       indice = 0
                  
                  })
                }
               }
             
            });
        
        })
     //MsqlInsert(images, )
    
})
app.post('/register', async(req,res)=>{
    const mail = req.body.mail;
    const pass = req.body.password;
    const user = req.body.user;
    const name_user = req.body.name
    let password = await bcryptjs.hash(pass,8)
const values ={
    name:name_user,
    user:user,
    password:password,
    mail:mail,
    type:"client"
}
DB.query('SELECT * FROM users WHERE mail = ?',[mail],(err,rows,fields)=>{
    if(rows.length>0){
        res.send("correo")
    }else {
        DB.query('SELECT * FROM users WHERE user = ?',[user],(err,rows,fields)=>{
      if (rows.length>0){
        res.send("user")
      }else{
        res.send("succes")
        DB.query('INSERT INTO users SET ?', values),async (err,results )=>{
        
        
             
        
         }
      }

        })
    }

}) 
})
app.post('/login', async(req, res) => {
    let mail = req.body.user
    let pass = req.body.password
    let password = await bcryptjs.hash(pass,8) 
    DB.query('SELECT * FROM users WHERE mail = ?',[mail],async(err,rows,fields)=>{
  //se comprueba el usuario
            if (rows.length == 0) {
              res.send("user");
            }
        
            //se comprueba la contraseña
             else if (!(await bcryptjs.compare(pass, rows[0].password))) {
               res.send("pass");
             } else{
              req.session.loggedin = true;
              req.session.name = rows[0].user;

               user = req.session.name
               res.send({type:"succesClient", user: user} )
             }

    })
  });
  app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  });
//starting the server
app.listen(app.get('port'),()=>{
    console.log('server on port ' + app.get('port'));
})