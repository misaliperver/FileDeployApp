var mongoose = require('mongoose');


var Schema = mongoose.Schema;

//dersKodu: {type: String, required: true, unique: true}
var fileSchema = new Schema({
        filename: String,
        filedelete: String,
        uzantisi:String,
        userid: String
}, {collection: 'upload'});


FileModel = mongoose.model('fileModel', fileSchema);


module.exports = FileModel;