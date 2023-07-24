// const connectionUrl='mongodb://localhost:27017/project_tracking';

// module.exports=connectionUrl;
const config = require('../config.json');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || config.connectionString, { useCreateIndex: true, useNewUrlParser: true ,useUnifiedTopology:true });
mongoose.Promise = global.Promise;

module.exports = {
    Project: require('../controller/project/projectModel'),
    File:require('../controller/file-upload/fileModal'),
    FolderCreation:require('../controller/file-upload/folder.modal'),
    MainProject:require('../controller/file-upload/main-project.model'),
    User:require('../controller/project/user.model'),
    passwordResetToken:require('../controller/project/resettoken')
}