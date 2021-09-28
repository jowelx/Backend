const mysql = require('mysql')

const connect =  mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'leyla'
})
connect.connect(function(err){
    if(err){
        console.log(err);
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