const db = require("../../_helper/db");
const file = db.File;
const folderCreation = db.FolderCreation;
const fileUpload = require("express-fileupload");
const { Project ,MainProject ,File} = require("../../_helper/db");
const fs = require("fs");
const mongoose = require('mongoose');
const passwordResetToken =db.passwordResetToken;
const connection = mongoose.connect('mongodb://localhost/flyaudit');
var mongooseDynamic = require ('mongoose-dynamic-schemas');
var CircularJSON = require('circular-json')
var ObjectID = require("mongodb").ObjectID;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const config = require("../../config.json");
//const fileService = require('./file-service');
(path = require("path")),
  (exports.saveFile = async (req, res) => {
    const fileData = req.body;

    const saveFile = new file(fileData);
    try {
      await saveFile.save();
      res.status(201).json(saveFile);
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  });

exports.getFiles = async (req, res) => {
  try {
    const getAllFiles = await file.find();
    res.status(200).json(getAllFiles);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

exports.getAll = async (req, res , next) => {
let returnArray = [];
const _findMain =  await MainProject.find({});
const client = await MongoClient.connect(url, { useNewUrlParser: true })
    .catch(err => { console.log(err); });
    if (!client) {
      return;
  }
    const db = await client.db("flyaudit");
    if(_findMain && _findMain.length>0){
     for (const pr of _findMain) {
        const _collectionName = pr.mainProjectName.replace(/\s+/g, "-");
        let collection = await db.collection(_collectionName);

      var _dinn = await db.collection(_collectionName).find({}).toArray();
      const projectionData = { columnsFields: 1 };
      const _getFields =  await MainProject.find({mainProjectName:pr.mainProjectName},projectionData);

   //   console.log(_getFields)

      let _returnObject ={
          mainProject : pr.mainProjectName,
          objectArray :_dinn,
          columns:_getFields
      }
     if(_dinn)
      returnArray.push(_returnObject)
      }
    };
    const str = CircularJSON.stringify(returnArray);
    res.status(200).json(JSON.parse(str));
}




exports.deletMainProject = (req ,res)=>{
  console.log('dsadasdsadsad')
      const _id = req.params.id
      console.log('detelet')
      console.log(_id)
      res.status(200).json('docs');
}



exports.donwload = (req, res) => {
  var fileName = req.body.originalName;
  var id = req.body["Uploaded folder name"].replace(/\s+/g, "_");
  
  res.download(path.join(`${config.dowloadPath}${id}/${fileName}`), (err) => {
    console.log(err);
  });

};

exports.deleteProject = async (req, res, next) => {
  var _id = req.body._id;
  var _collection = req.body._collection.replace(/\s+/g, "-"); ;
   MongoClient.connect(url,  function(err, db) {
    if (err){
      res.status(500).json({err});
    };
    var dbo = db.db("flyaudit"); //config.dbName
      dbo.collection(_collection).deleteOne({ _id: ObjectID(_id)} ,function (err, docs) {
        res.status(200).json({docs});
});
  });
};

exports.folderCreation = (req, res, next) => {
  let folderName = req.body.name;
  const dir = "../../file/" + folderName;
  console.log(dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
    res.status(200).json("Folder created !");
  } else {
    res.status(500).json("Folder is already created");
  }
};
exports.getAllMainProject = async(req ,res, next)=>{
      return await MainProject.find({},function(err , reslt){
        if(!err){
          res.status(200).json(reslt);
        }
       
      })
}

exports.deleteFileDocument = async(req ,res, next)=>{



  
  const _file = req.body.data;
  const _directory = _file["Nume Folder"]
 // console.log(_directory)

  fs.unlink(config.dowloadPath+ _directory +"/"+_file.originalName, async(err) => {
    if (err) {
      res.status(500).json("failed to delete local image:"+err);
        //console.log("failed to delete local image:"+err);
    } else {
        // console.log('successfully deleted local image');     
        await File.deleteOne({"id" : _file.id},function(err ,response){
                      if(err){
                        res.status(500).json("failed to delete local image:"+err);
                      }else{
                        res.status(200).json('successfully deleted local image');
                      }
        })     
                              
    }
});
  // return await MainProject.find({},function(err , reslt){
  //   if(!err){
  //     res.status(200).json(reslt);
  //   }
   
  // })
}

exports.getByIdMainProjectUnique=async(req ,res, next)=>{
  try{
    const reqId = req.params.id;
    const _findProject =  await MainProject.find({uniqueIndex:reqId});
    if(_findProject){
      res.status(200).json(_findProject);
    }
   

  }catch(err){
 res.status(500).json(err);
  }
  

}


exports.getByIdMainProject =async(req ,res, next)=>{
  try{
    const reqId = req.params.id;
    const _findProject =  await MainProject.find({_id:reqId});
    if(_findProject){
      res.status(200).json(_findProject);
    }
   

  }catch(err){
 res.status(500).json(err);
  }
  

}
exports.deletMainProject = async(req ,res, next)=>{

}



exports.getAllFolderNames = async (req, res, next) => {
  var _responseData = await folderCreation.find({});
  res.status(200).json(_responseData);
};
exports.getProjectData = async (req, res, next) => {
  let _returnArray = []
  var _collection = req.params.id.replace(/\s+/g, '-');
        
    const _findproject = await MainProject.findOne({mainProjectName:req.params.id.toLowerCase()});
    if(_findproject){
      _returnArray.push(
        
    {
      type:'column',
      field:_findproject
    }
      ); 
   const _findProject =   MongoClient.connect(url,  function(err, db) {
        if (err){
          res.status(500).json({err});
        };
        var dbo = db.db("flyaudit"); //config.dbName
        
          dbo.collection(_collection).find({}).toArray(function (err, docs) {
            res.status(200).json({_returnArray , docs});
    });
      });
      }else{
      res.status(404).json({ message: 'There is no sufficient project name in the system !'});
    }
};
exports.getByName = async (req, res, next) => {
  var _findProjects = await file.find({ folderName: req.params.name });
  res.status(200).json(_findProjects);
};
exports.validateToken = async (req, res ,next)=>{
  //console.log('ValidaPasswordTokern')
  if (!req.body.resettoken) {
  return res
  .status(500)
  .json({ message: 'Token is required' });
  }
  const user = await passwordResetToken.findOne({
  resettoken: req.body.resettoken
  });
  console.log(user)
  if (!user) {
  return res
  .status(409)
  .json({ message: 'Invalid URL' });
  }


  User.updateOne({ _id: user._userId },{ $set: {_id: user._userId}})
  .then(() => {
  res.status(200)
  .json({
       message: 'Token verified successfully.' 
      });
  }).catch((err) => {
  return res.status(500).send({ msg: err.message });
  });
}

exports.deleteProjectFile = async(req  ,res ,next)=>{
    //console.log(req.body);

    
    const _file = req.body.fileName
    const _directory = req.body.folderName;
    const collection = req.body.collectionName.replace(/\s+/g, "-");
    const columnName = req.body.columns.replace(/\s+/g, "_");;
   // console.log(_directory)
  
    fs.unlink(config.dowloadPath+ _directory +"/"+ _file, async(err) => {
      if (err) {
        res.status(500).json("failed to delete local image:"+err);
          //console.log("failed to delete local image:"+err);
      } else {

          MongoClient.connect(url,  function(err, db) {
            if (err){
              res.status(500).json({err});
            };
            // let query = {};
            // query[param.columnName.replace(/\s+/g, "_")] = _folderObj;
            // //console.log(collection)
            // dbo.collection(collection.replace(/\s+/g, "-")).updateMany(
            //   { _id: ObjectID(uniqueId) }, { $push: query },
            let _folderObj = {
              id: req.body.subId, 
            }
            let query = {};
            console.log(columnName);
            console.log(collection)
            query[columnName] = _folderObj;
            //console.log(query)
            console.log(query)
            var dbo = db.db(config.dbName); //config.dbName
              dbo.collection(collection).updateOne({ _id: ObjectID(req.body.mainid)} ,{
                $pull:query
              } ,function (err, docs) {
                res.status(200).json({docs});
        });
          });
          



                                
      }
  });

}
exports.createMainProject = async(req ,res, next)=>{

  const Schema = mongoose.Schema;
  const projectObj = req.body;
  var columns = [];
  //mandorty fields;
  let _mandorry = [
    {
      "columnName": 'startDate',
      "type":"Date",
      "dbName": 'startDate'
      
    }
  //   {
  //     "columnName":'crectinTerm',
  //     "type":"Date",
  // }
    // ,
    // {
    //   "columnName":'deadLine',
    //   "type":"Date",
    // }
  ]
  //console.log(projectObj)
  if(projectObj.columnsFields){
    projectObj.columnsFields.forEach((column , index)=>{
        // const _addField = {
        //   "columnName": column.columnName,
        //   "type":(column.columnName == 'Deadline' || column.columnName == 'Termen Corectie')?"Date":"text",
        //   "dbName": column.columnName.replace(/\s+/g, "_")
        // }
    
        const _addField = {
          "columnName": column.columnName,
          "type":column.type,
          "oldName":column.oldValue,
          "deadlineNumber":column.deadlineNumber,
          "dbName": column.columnName.replace(/\s+/g, "_")
        }
        _mandorry.push(_addField);
    });

projectObj.columnsFields = _mandorry;
  }

 var _findProject = await MainProject.findOne({mainProjectName : projectObj.mainProjectName.toLowerCase()});
  if(!_findProject){
    //this.getSchemaObject(projectObj.columnsFields , projectObj.mainProjectName)
    // return;
    //console.log('athule')
  const mainProject = new MainProject(projectObj);
  try {
    await mainProject.save()

    
    res.status(200).json(mainProject);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}else{
    res.status(500).json({ message: 'The project name is already available' });
  }

//  exports.getSchemaObject=(projectObj ,project)=>{


//   // projectObj.columnsFields.forEach((columns , data)=>{
//   //   columns:{
//   //     type:Date
//   //   }
//   // })

//   const _findData = connection.db.getCollection('dsdsds').find({});

//   res.status(200).json(_findData);

//   // const schema = mongoose.Schema({
//   //   startDate:{
//   //     type:Date
//   //   },
//   //   crectinTerm:{
//   //     type:Date
//   //   },
//   //   deadLine:{
//   //     type:Date
//   //   },
//   //   CreateDate:{
//   //     type: Date,
//   //     default: Date.now
//   //   },

//   // })
  
//   // var ScehamaObj = mongoose.model(project);

//   // ew ScehamaObj({}).save().then(res=>{
//   //   console.log("Schema created")
//   };n
 
// projectObj.forEach((data , index)=>{
      
//           console.log('Scehama not function')
//           schema.then(
//             result=>{
//               mongooseDynamic.addSchemaField(ScehamaObj,
//                 data,{
//                   type: String,
//                  default : "NO"
//                 }
//               )
//             }
//           );
          


// });
// console.log(schema)
 
}



exports.deleteMainProject = async (req, res ,next) => {
  // var _findAll = await Project.find({});
  if(req.body)
    var  _id = req.body.id;
    if(_id){
       const _delteDone = await MainProject.deleteOne({"_id": _id});
       if(_delteDone){
        res.status(200).json(_delteDone);
       }else{
        res.status(500).json(_delteDone);
       }

    }
};








