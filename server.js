const express = require('express');
const app = express();

app.use(express.static('./public',{
    setHeaders:(response, staticAssestPath, staticAsset)=>{
        response.set('Cache-Control','no-cache');
        console.log("static assest: " ,staticAsset)
        console.log("static assest path: " ,staticAssestPath);
    }
}));

app.listen(3000,()=>{
    console.log("Listening at 3000");
})
