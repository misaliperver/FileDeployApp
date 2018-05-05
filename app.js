const express = require('express');
var randomstring = require("randomstring");
const path = require('path');
var app = express();
var upload = require('express-fileupload');
const http = require('http');

var io = require('socket.io')(http);
http.Server(app).listen(80); // make server listen on port 80

var db = require(path.join(__dirname, './app_server/model/db'));
var Files = require(path.join(__dirname, './app_server/model/file'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(upload()); // configure middleware

console.log("Server Started at port 80");
//Dosya uzantısını bulmak için fonksiyon
function getFileExtension(filename) {
  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}


app.get('/',function(req,res){
  res.sendFile(__dirname+'public/index.html');
  
})



app.post('/upload',function(req,res){
  //console.log(req.files); //gelen dosyayı göster
  if(req.files.upfile){
    var file = req.files.upfile;
    var name = file.name;
    var type = file.mimetype;


    var dosyaEkle = new Files({
      filename: name,
      filedelete: randomstring.generate(7),
      userid: 'defaultID'
    });
    dosyaEkle.save(function(err){
        if(err){
            console.log('model hatası..: '+  err);           
        }else{
            console.log(dosyaEkle._id + ' dosya mogoya eklendi...');
            var uploadpath = __dirname + '/uploads/' + dosyaEkle._id + '.' + getFileExtension(name);
            file.mv(uploadpath,function(err){
              if(err){
                console.log("File Upload Failed",name,err);
                res.send("Error Occured!")
              }
              else {
                console.log('dosyauzantısı...: ' + getFileExtension(name));
                console.log("File Uploaded",name);
                res.send('Done! Uploading files')
              }
            });
        }
    });
    
  }
  else {
    res.send("No File selected !");
    res.end();
  };
})
