const express=require('express');
const router=express.Router();

const project=require('../controller/project/project.controller');
const fileUpload=require('../controller/file-upload/file.controller');


router.get('/getProjectStatus',project.getProjectStatus);

router.patch('/updateProject/:id',project.updateProject);

router.patch('/updatecorrectiveAction',project.updatecorrectiveAction);
router.post('/saveProject',project.saveProject)
router.post('/addFilesUpdateproject',project.addFilesUpdateproject)
router.post('/savePostProjectFile', fileUpload.saveFile);
router.post('/login', project.authentication);
router.post('/register', project.register);
router.post('/req-reset-password', project.reqPassword);
router.post('/folder-creation', fileUpload.folderCreation);
router.post('/valid-password-token', fileUpload.validateToken);
router.post('/createMainProject', fileUpload.createMainProject)
router.post('/new-password', project.newPassword)
router.post('/deleteProjectFile', fileUpload.deleteProjectFile)

router.get('/loagSubprojectById', project.loagSubprojectById)
router.get('/getFiles',fileUpload.getFiles)
router.post('/delete-project',fileUpload.deleteProject)
router.post('/deletMainProject',fileUpload.deleteMainProject)
router.post('/download',fileUpload.donwload)
router.get('/getAll/:id',fileUpload.getAll)
router.get('/getByName/:name',fileUpload.getByName)
router.get('/getAllFolderNames',fileUpload.getAllFolderNames);
router.get('/getAllMainProject',fileUpload.getAllMainProject);
router.get('/getByIdMainProject/:id',fileUpload.getByIdMainProject);
router.get('/getByIdMainProjectUnique/:id',fileUpload.getByIdMainProjectUnique);

router.put('/deletDocument',fileUpload.deleteFileDocument);

// router.delete('/deletMainProject/:id',fileUpload.deletMainProject);


router.get('/getByProjectName/:id' , fileUpload.getProjectData)

module.exports=router;