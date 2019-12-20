// lib/app.ts
import express = require('express');

import Echo from 'laravel-echo';
const axios = require('axios');
var token = "";
var codice_impianto="WOLLS19;"
var nome_impianto="";
//const app: express.Application = express();

let io = require('socket.io-client');
let echo: Echo;

//login();
getPlantData();
startServer();
var host_paolo = "http:/35.180.83.154"
var host_federico = "http:/3.16.169.253"

function login() {
  axios.post( host_paolo+'/itproxy/public/login', {
    username: 'italprogetti',
    password: '1',
    plant_code: 'WOLLS19;'
  })
    .then((res: any) => {
      if (res.status == 200) {
        token = res.data.success.token;
        getPlantData();
       // startServer();
      }

    })
    .catch((error: any) => {
      console.log("UNAUTHORIZED")
      console.error(error)
    })

}
function getPlantData(){
  console.log("RETRIVNIG PLANT DATA...")
  let url = host_paolo+'/itproxy/public/api/impianto/'+codice_impianto;
  axios.get( 
    url,
    {headers: {
        "Authorization" : "Bearer " + token,
      }
    }
  ).then((res: any) => {
    if (res.status == 200) {
      nome_impianto = res.data.nome
      sendData();
    }

  })
}

function startServer() {
  echo = new Echo({
    broadcaster: 'socket.io',
    host: host_paolo+':6001',
    client: io,
    auth: { headers: { Authorization: "Bearer " + token } }
  });
}



async function sendData() {
  console.log("SENDING DATA");
  await sleep(2000)
  echo.channel(nome_impianto).listen('.actionrequest', (e: any) => {
    let action = e['action'];
    let id = e['id'];

    if (action=="getodp"){
     let id_odp =  e['param1'];
     let url ='http://localhost/getodp/'+id_odp;
     console.log(url)
    axios.get(url).then((response:any) => {
      axios.post(host_paolo+':6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
        "channel":nome_impianto,
        "name": "actionresponse",
        "data":{"eventData":JSON.stringify(response.data),"id":id,"action":"getodp"}  ,
        
        "socket_id": echo.connector.socket.id
      
    })
      .then((response:any) => {
       console.log(response)
      });
  });
}
if (action=="getodplist"){
  let stato =  e['param1'];
 // let limit =  e['param2'];
  let url ='http://localhost/getodplist/'+stato+"/100000";
  console.log(url)
 axios.get(url).then((response:any) => {
   axios.post(host_paolo+':6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
     "channel":nome_impianto,
     "name": "actionresponse",
     "data":{"eventData":JSON.stringify(response.data),"id":id,"action":"getodplist"}  ,
     "socket_id": echo.connector.socket.id
   
 })
   .then((response:any) => {
    
   });
});
}


if (action=="getconsumi"){
  let id_odp =  e['param1'];
  let url ='http://localhost/getconsumi/'+id_odp;
  console.log(url)
 axios.get(url).then((response:any) => {
   axios.post(host_paolo+':6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
     "channel":nome_impianto,
     "name": "actionresponse",
     "data":{"eventData":JSON.stringify(response.data),"id":id,"action":"getconsumi"}  ,
     
     "socket_id": echo.connector.socket.id
   
 })
   .then((response:any) => {
    
   });
});
}
})


  await sleep(3000)
  while(true) {
    await sleep(2000)
    axios.get('http://localhost/api/auth/getdata').then((response:any) => {
      axios.post(host_paolo+':6001/apps/06be5ce7b43ad4f7/events?auth_key=a0764f6b0a5f586a0e7fcf72ffe3e01f', {
        "channel":nome_impianto,
        "name": "drumdata",
        "data":{"eventData":JSON.stringify(response.data)}  ,
        "socket_id": echo.connector.socket.id
      
    })
      .then((response:any) => {
       
      });
  });
   
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
