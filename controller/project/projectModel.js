const mongoose=require('mongoose')

const Schema=mongoose.Schema;

const schema=new Schema({
    name:{
        type:String   
    },



    startDate:{
        type:Date,
    },
    deadLine:{
        type:Date,
    },
    context:{
        type:String
    },
    incharge:{
        type:String,
    },
    status:{
        type:Number
    },
    createDate:{
        type: Date,
        default: Date.now
    },
    responsible:{
        type:String,
    }
    ,
    description:{
        type:String,
    },
    stage:{
        type:String,
    }
    ,
    crtionStageAction:{
        type:String,
    }
    ,
    crectinTerm:{
        type:Date,
    }
    ,
    auditor:{
        type:String,
    },
    crectinAction:{
        type:String,
    },
    correctiveAction: {
        type:String,
    }

    




})

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('saveproject', schema);
