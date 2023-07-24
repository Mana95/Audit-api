const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const schema=new Schema({
    name:{
        type:String
    },
    fileName:{
        type:String
    },
    id:{
        type:String
    },
    type:{
        type:String
    },
    orginalName:{
        type:String
    },
    createDate:{
        type: Date,
        default: Date.now
    },
    folderName:{
        type:String  
    }
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('file-project', schema);