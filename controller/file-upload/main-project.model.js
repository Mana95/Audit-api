const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const schema=new Schema({
    mainProjectName:{
        type:String,
        unique: true,
    },
    uniqueIndex:{
        type:String,
        unique:true,
    },
    customDeadline:{
        type:Number,

    },
    columnsFields:[],
    createDate:{
        type: Date,
        default: Date.now
    },

});

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('main-project', schema);