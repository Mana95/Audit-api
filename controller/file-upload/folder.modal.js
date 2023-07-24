const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const schema=new Schema({
    name:{
        type:String
    },
    createDate:{
        type: Date,
        default: Date.now
    },
});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('file-folder', schema);