const db = require("../../_helper/db");
const moment = require('moment');
const mongoose = require('mongoose');
const connection = mongoose.connect('mongodb://localhost/flyaudit');
var mongooseDynamic = require ('mongoose-dynamic-schemas');
const { Project ,MainProject } = require("../../_helper/db");
var ObjectID = require("mongodb").ObjectID;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


module.exports = {getALl}



async function getALl(){
    


let returnArray = [];
let _findAllMainProject = [];
const _findMain =  await MainProject.find({});
const client = await MongoClient.connect(url, { useNewUrlParser: true })
    .catch(err => { console.log(err); });
    if (!client) {
      return;
  }

    const db = client.db("flyaudit");
    if(_findMain && _findMain.length>0){
      _findMain.forEach(async(pr , prIndex)=>{
        const _collectionName = pr.mainProjectName.replace(/\s+/g, "-");
        let collection = db.collection(_collectionName);
        let res = await collection.find({});
        returnArray.push(res);
        if(_findMain.length == returnArray.length){
           // console.log(returnArray)
           console.log(_findMain.length)
           console.log(returnArray.length)
            return 1
          }

      })
   
    }
}
