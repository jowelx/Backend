const mysql = require('mysql')
const connect =  mysql.createConnection({
    host:process.env.HOST_DB,
    user:process.env.USER_DB,
    password:process.env.PASSWORD_DB,
    database:process.env.DATABASE
})
connect.connect(function(err){
    if(err){
        console.log(err);
       // setTimeout(handleDisconnect, 20000);
       return
    }else{
        console.log('Db connect')
    }
})
function Msqlinsert(TABLE, VALUES){

   connect.query('INSERT INTO'[TABLE],'SET ?',VALUES ),async (err,results )=>{
        if(err){
            console.log(err)
        }else{
            console.log(results)
            console.log('todo piola pa')
        }

    }
}
module.exports = connect;