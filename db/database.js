const mysql = require('mysql')
const connect =  mysql.createConnection({
    host:"byldsc6eg4toh0pgbowc-mysql.services.clever-cloud.com",
    user:"uvkw3pufq1tsnl91",
    password:"941FRA4vpeWqfB5wcwbD",
    database:"uvkw3pufq1tsnl91"
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