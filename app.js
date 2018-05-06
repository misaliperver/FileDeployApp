const express = require('express');
const fs = require('fs');
var randomstring = require("randomstring");
const path = require('path');
var app = express();
var ejsLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');
var upload = require('express-fileupload');
const http = require('http');


var db = require(path.join(__dirname, './app_server/model/db'));
var Files = require(path.join(__dirname, './app_server/model/file'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs'); // Kullandığım görüntü motorunu belirttim
app.set('views', path.join(__dirname, './app_server/views')); //Görüntüleri oluşturacağım klasörümün konumunu bildirdim
app.use(bodyParser.urlencoded({ extended: false })); // reuest objesini kullanabileceğimiz forma getirecek
app.use(bodyParser.json());
app.use(ejsLayouts);// ejs-layoutsu ekle
app.use(upload()); // configure middleware

console.log("Server Started at port 80");

//Dosya uzantısını bulmak için fonksiyon
function getFileExtension(filename) {
  return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}


app.get('/',function(req,res){
  Files.find({}, function(err, files) {
    if (!err){ 
      for(var i=0; i<files.length; i++) {files[i].filedelete=':)';}
        res.render('anasayfa', {
          _files: files 
        });
    } else {throw err;
      res.send('hata');
    }
  
  });
});

app.get('/Kullanimsartlari', function(req, res) {
  res.render('Kullanimsartlari');
});

app.get('/:id', function(req, res) {
  var _idx = req.params.id;
  if(_idx.length == 31){
    var findfile = _idx.substring(0,24);
    var deletefile= _idx.substring(24,31);
    console.log(findfile + "  " + deletefile); // gelen idyi yazdırma
    
    Files.findOne({_id: findfile}, function (err, xfile) {
      //console.log('finOne içine girdi');
      if(xfile != null){
        if(xfile.filedelete == deletefile){
          fs.unlink(__dirname + '/public/uploads/' + findfile + '.' + xfile.uzantisi);
          xfile.remove();
          res.render('bildirim',{'_bildirim':'Silindi!'});
        }else{  res.render('bildirim',{'_bildirim':'Silme Kodunuz Yanlış!'});  }
      }else{  res.render('bildirim',{'_bildirim':'Böyle Bir Dosya Yok!'});  }
    
    });
  }
  else{  res.render('bildirim',{'_bildirim':'Erişim İzniniz Yok!'});  }
});



app.post('/upload',function(req,res){
  //console.log(req.files); //gelen dosyayı göster
  if(req.files.upfile){
    var file = req.files.upfile;
    var name = file.name;
    var type = file.mimetype;


    var dosyaEkle = new Files({
      filename: name,
      filedelete: randomstring.generate(7),
      uzantisi:getFileExtension(name),
      userid: 'defaultID',
      downloaded: 0
    });
    dosyaEkle.save(function(err){
        if(err){
            console.log('model hatası..: '+  err);           
        }else{
            console.log(dosyaEkle._id + ' dosya mogoya eklendi...');
            var uploadpath = __dirname + '/public/uploads/' + dosyaEkle._id + '.' + getFileExtension(name);
            file.mv(uploadpath,function(err){
              if(err){
                console.log("Dosyayı Yükleme Başarılı Olamadı",name,err);
                res.send("Yükleme Hatasi!")
              }
              else {
                console.log('dosyauzantısı...: ' + getFileExtension(name));
                console.log("Dosya Yüklendi",name);
                res.render('dosya', {
                  _dosya : dosyaEkle
                });
              }
            });
        }
    });
    
  }
  else {
    res.send("No File selected !");
    res.end();
  };
});
var file = fs.createWriteStream("file.jpg");
app.get("/down/:id", function(req,res) {
  var _idx = req.params.id;
  if(_idx.length == 24){
    var findfile = _idx.substring(0,24);
    
    Files.findOne({_id: findfile}, function (err, xfile) {
      //console.log('finOne içine girdi');
      Files.findOneAndUpdate({_id: findfile}, {$set:{downloaded:xfile.downloaded+1}}, {new: true}, function(err, doc){
        if(err){console.log("Something wrong when updating data!"); }
      });
      if(xfile != null){
        var filepath = __dirname + '/public/uploads/' + findfile + '.' + xfile.uzantisi;
        res.download(filepath);
      }else{  res.render('bildirim',{'_bildirim':'Böyle Bir Dosya Yok!'});  }
    
    });
    
  }
  else{  res.render('bildirim',{'_bildirim':'Erişim İzniniz Yok!'});  }
});


http.Server(app).listen(80); // make server listen on port 80