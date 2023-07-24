const express = require("express");
const empty = require("empty-folder");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const db = require("./_helper/db");
const route = require("./routes/routes");
var multer = require("multer");
const app = express();
const path = require("path");
const shell = require("shelljs");
const fs = require("fs");
const nodemailer = require("nodemailer");
// import { app } from "electron";
 var {remote ,electron} = require('electron');
const Project = db.Project;
const folderCreation = db.FolderCreation;
const ProjectController = require("./controller/project/project.controller");
const config = require("./config.json");
//const electron = require('electron');

app.use(cors({ origin: config.prodEnvironment }));
app.use(bodyParser.json({ limit: config.bodyParser }));

app.use("/routes", route);

require("http")
  .createServer(function (req, res) {
    res.end("Hello from server started by Electron app!");
  })
  .listen(9000);

var storage = multer.diskStorage({
  //Pass function that will generate destination path
  destination: function (req, file, cb) {
    console.log(file);
    console.log(req.params.id)
  let destination = config.dowloadPath + req.params.id.replace(/\s+/g, "_");
    cb(null, destination);
  },

  filename: function (req, file, cb) {
    // console.log(file.originalname)
    var datetimestamp = Date.now();
    cb(null, file.originalname);
    //  return res.json();
  },
});

var Prostorage = multer.diskStorage({
  
  destination:function(req, file , cb){
  
    let str = req.params.id;

    const dir = config.dowloadPath + str;
    let destination = path.join(__dirname, dir); //uploading
    // let destination = path.join(dir);
    shell.mkdir('-p',dir);
    destination =path.join(destination, '',req.params.id);
    const pathdsd =  config.dowloadPath + req.params.id;
    
    cb(null, pathdsd);
 
  },
  filename:function(req, file, cb) {
   
    var datetimestamp = Date.now();
    cb(null, file.originalname);
}
})

var projectUpload = multer({
  storage: Prostorage,
}).single("file");





var upload = multer({
  //multer settings
  storage: storage,
}).single("file");

app.post("/folder-create/:id", function (req, res) {
  const folderreation = new folderCreation(req.body);
  var saveFolder = folderreation.save();
  try{
    if (saveFolder) {
      let str = req.body.name.replace(/\s+/g, "_");
     // console.log()
     // var toLocalPath = path.resolve(app.getPath("documents")) ;
  //   var desktopPath = main.app.getPath('C://Users/Manoj/Documents/Files/');
  //   console.log(desktopPath)
      const dir = config.dowloadPath + str;

      console.log(dir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(
          dir,
          {
            recursive: true,
          },
          function (err, result) {
            if (err) {
              console.log(err);
            }else{
              console.log(result)
            }
          }
        ); 
        res.status(200).json("Folder creation done");
      } else {
        res
          .status(500)
          .json(
            "Insertered folder name is already created,Please try an another name"
          );
      }
    } else {
      res.status(500).json("error");
    }
  }catch(erro){
    console.log(erro);
  }
  
});

app.post("/upload/:id", function (req, res) {
  // console.log(req.params.id);
  // empty('./file', false, (o)=>{
  //   if(o.error){
  //     console.error(o.error);
  //   } else{
  //     console.log(o)
  //   }
  //   //console.log(o.removed);
  //   //console.log(o.failed);
  // });
  //   const dir = './file/dsds';
  // if (!fs.existsSync(dir)) {
  // 	fs.mkdirSync(dir, {
  // 		recursive: true
  // 	});
  // }
  
  upload(req, res, function (err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    } else {
      return res.json();
    }
  });
});

app.post("/projectupload/:id" , function(req, res) {
  
  projectUpload(req, res, function (err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    } else {
      return res.json();
    }
  });
})


const PORT = process.env.PORT || config.serverPort;
app.listen(PORT, () => {
  var adeadLineCnt = this.getDeadLineCount()
    .then((res) => {
      if (
        res != null &&
        res > 0 &&
        config.email != "" &&
        config.sendMail != "" &&
        config.password != ""
      ) {
        this.sendMail(res);
      }
    })
    .catch((error) => {
      console.log(error);
    });

  console.log("SERVER RUNNING");
});
// mongoose.set('useFindAndModify',false)

exports.getDeadLineCount = async () => {
  let dataCount;
  const projectFind = await Project.find({ status: 1 });

  if (projectFind) {
    var _getStatusCount = ProjectController.getDeadlineCount(projectFind);
    //   console.log(_getStatusCount)
    return _getStatusCount;
  }
  return null;
};

const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: config.email,
    pass: config.password,
  },
  secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

exports.sendMail = (res) => {
  const count = res;

  const mailData = {
    from: config.email,
    to: config.senderEmail,
    subject: "Notice Tracking App",
    text: "test",
    html: `<!DOCTYPE html>
        <html>
        <head>
        
          <meta charset="utf-8">
          <meta http-equiv="x-ua-compatible" content="ie=edge">
          <title>Notice Tracking App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
          /**
           * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
           */
          @media screen {
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 400;
              src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
            }
        
            @font-face {
              font-family: 'Source Sans Pro';
              font-style: normal;
              font-weight: 700;
              src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
            }
          }
        
          /**
           * Avoid browser level font resizing.
           * 1. Windows Mobile
           * 2. iOS / OSX
           */
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
          }
        
          /**
           * Remove extra space added to tables and cells in Outlook.
           */
          table,
          td {
            mso-table-rspace: 0pt;
            mso-table-lspace: 0pt;
          }
        
          /**
           * Better fluid images in Internet Explorer.
           */
          img {
            -ms-interpolation-mode: bicubic;
          }
        
          /**
           * Remove blue links for iOS devices.
           */
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }
        
          /**
           * Fix centering issues in Android 4.4.
           */
          div[style*="margin: 16px 0;"] {
            margin: 0 !important;
          }
        
          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        
          /**
           * Collapse table borders to avoid space between cells.
           */
          table {
            border-collapse: collapse !important;
          }
        
          a {
            color: #1a82e2;
          }
        
          img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
          }
          </style>
        
        </head>
        <body style="background-color: #e9ecef;">
        
          <!-- start preheader -->
          <div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
            A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
          </div>
          <!-- end preheader -->
        
          <!-- start body -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
        
            <!-- start logo -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end logo -->
        
            <!-- start hero -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Notice Tracking App</h1>
                    </td>
                  </tr>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end hero -->
        
            <!-- start copy block -->
            <tr>
              <td align="center" bgcolor="#e9ecef">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        
                  <!-- start copy -->
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                      <p style="margin: 0;">
                       Please note ${count} Ongoing Project/s is/are reached the deadline those are display status as  Yellow
                  </p>
                    </td>
                  </tr>
                  <!-- end copy -->
        
                  <!-- start button -->
                  <tr>
                    <td align="left" bgcolor="#ffffff">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                  <a href="http://localhost:4200" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Get More Information</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- end button -->
        
                  <!-- start copy -->
                  
                  <!-- end copy -->
        
                  <!-- start copy -->
                  <tr>
                
                  </tr>
                  <!-- end copy -->
        
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end copy block -->
        
            <!-- start footer -->
            <tr>
              <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
        
        
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
              </td>
            </tr>
            <!-- end footer -->
        
          </table>
          <!-- end body -->
        
        </body>
        </html>`, // html body
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return console.log(error);
    }
    res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
};
