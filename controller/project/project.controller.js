const db = require("../../_helper/db");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const config = require("../../config.json");
const Project = db.Project;
const User = db.User
const MainProject = db.MainProject;
const passwordResetToken = db.passwordResetToken;
const mongoose = require("mongoose");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var mongooseDynamic = require("mongoose-dynamic-schemas");
const { collection } = require("./projectModel");
var ObjectID = require("mongodb").ObjectID;
const Schema = mongoose.Schema;
//get project by status          1 = ongoing   2=Completed
exports.getProjectStatus = async (req, res, next) => {
  var returnArrayObject = [];
  try {
    const _paramId = req.query._id;
    const _collection = req.query._collection.replace(/\s+/g, "-");

    if (_paramId) {
      if (_paramId == 1) {
        //onGoing

        const projectFind = await eval(collection).find({ status: 1 });
        if (projectFind) {
          returnArrayObject.push(projectFind);
        }
        const _getdeadLineCount = this.getDeadlineCount(projectFind);
        if (_getdeadLineCount) {
          returnArrayObject.push(_getdeadLineCount);
        }
      } else if (_paramId == 2) {
        //Completed Project API

        const _projectFindCompleted = await eval(collection).find({
          status: _paramId,
        });
        if (_projectFindCompleted) {
          returnArrayObject.push(_projectFindCompleted);
        }
        const _findAllProject = await Project.find({});
        if (_findAllProject) returnArrayObject.push(_findAllProject.length);
      } else {
        MongoClient.connect(url, function (err, db) {
          if (err) {
            res.status(500).json({ err });
          }
          var dbo = db.db(config.dbName);
          dbo
            .collection(_collection)
            .find({})
            .toArray(function (err, docs) {
              var _findValue = docs.find((s) => s._id == _paramId);

              if (_findValue) {
                returnArrayObject.push(_findValue);
                res.status(200).json(returnArrayObject);
              }
            });
        });
      }
    } else {
      res.status(500).json("Internal Server error happened");
    }
  } catch (error) {
    console.log(error);
  }
};
exports.addFilesUpdateproject = async (req, res, next) => {


  const collection = req.body.collectionName;
  const fileInfor = req.body.filInfo;
  const uniqueId = req.body.id
  MongoClient.connect(url, function (err, db) {
    if (err) {
      return res.status(500).json({ err });
    }
    var dbo = db.db(config.dbName);
    if (fileInfor && fileInfor.length > 0) {
      for (const param of fileInfor) {
        let _folderObj = {
          folderName: param.folderName,
          fileName: param.orginalName,
          type: param.fileType,
          id: param.id
        }
        let query = {};
        query[param.columnName.replace(/\s+/g, "_")] = _folderObj;
        //console.log(collection)
        dbo.collection(collection.replace(/\s+/g, "-")).updateMany(
          { _id: ObjectID(uniqueId) }, { $push: query },
          function (error, response) {
            if (error) {
              console.log(error);
            } else {

            }

          }
        )
      }
    }


    //console.log(_findCollection)


  })


  res.status(200).json({
    message: 'File uploaded succesfully'
  });


}
exports.loagSubprojectById = async (req, res, next) => {
  
  const id = req.query.id;
  const collection = req.query.collection;

  MongoClient.connect(url, function (err, db) {
    if (err) {
      return res.status(500).json({ err });
    }
    var dbo = db.db(config.dbName);
    
  
        dbo.collection(collection.replace(/\s+/g, "-")).findOne(
          { _id: ObjectID(id) },
          function (error, response) {
            if (error) {
              console.log(error);
            } else {
              return res.status(200).json(response);
            }

          }
        )
      
    


    //console.log(_findCollection)


  })



}
exports.saveProject = async (req, res, next) => {
  if (req.body == undefined) {
    return res.status(409).json("Request body is empty");
  }


  const _collection = req.body.collection;
  const _columns = req.body.fields.filter(tb => tb.type != 'File');
  const _formValues = req.body.formGroup;
  const folderInfo = req.body.fileInfo

  //Check collection is already avaible
  if (_collection) {
    var _findCollection = await MainProject.findOne({
      mainProjectName: _collection,
    });
    if (!_findCollection) {
      return res.status(500).json("Selected project is not valid project");
    }
  }
  ///
  const models = {};
  const _saveObject = {};



  _columns.forEach((data, index) => {
    if (!(data in models)) {
      models[data.dbName] = {
        type: (data.type == "Date") ? Date : (data.type == "text") ? String : Array
      };
    }

    _saveObject[data.dbName] = _formValues[data.dbName];

    // return models[collectionName];
  });
  models["status"] = {
    type: String,
  };
  models["id"] = {
    type: String,
  }
  if (req.body.filecat == true && req.body.fileInfo.length > 0) {
    for (const p of folderInfo) {
      models[p.columnName] = [{
        folderName: {
          type: String
        },
        fileName: {
          type: String
        },
        type: {
          type: String
        },
        id: {
          type: String
        }
      }];
    }
  }
  if (req.body.filecat == true) {

    let _folderModel = [];
    if (folderInfo.length > 0) {
      for (const par of folderInfo) {
        let _folderObj = {
          folderName: par.folderName,
          fileName: par.orginalName,
          type: par.fileType,
          id: par.id
        }
        _folderModel.push(_folderObj)
        _saveObject[par.columnName] = _folderObj;
      }

    }


  }

  _saveObject["status"] = "1";
  _saveObject["id"] = req.body.id;


  var _colletionName = _collection.replace(/\s+/g, "-");
  var modelClass;

  try {
    if (mongoose.model(`${_colletionName}`))
      modelClass = mongoose.model(`${_colletionName}`);
  } catch (e) {
    if (e.name === "MissingSchemaError") {
      var schema = new mongoose.Schema(models);
      schema.set("toJSON", { virtuals: true });
      modelClass = mongoose.model(
        `${_colletionName}`,
        schema,
        `${_colletionName}`
      );
    }
  }

  const saveSchema = new modelClass(_saveObject);

  saveSchema.save(_saveObject);
  res.status(200).json({ message: "Data Save succesfully" });
};

exports.getDeadlineCount = (projectFind) => {
  var _returnObject = [];
  var _currentDate = new Date();

  if (projectFind && projectFind.length > 0) {
    projectFind.forEach((project, pIndex) => {
      var deadlineDate = new Date(project.deadLine);
      var _setDate = deadlineDate.setDate(deadlineDate.getDate() - 7);

      if (_setDate <= _currentDate) {
        _returnObject.push(project.deadLine);
      }
    });
    _getDeadlineCount = _returnObject.length;
  }
  return _returnObject.length;
};

exports.register = async (req, res, next) => {
  if (req.body) {
    const regData = req.body;
    if (await User.findOne({ email: regData.email })) {
      res.status(409).json({ error: 'Already inserted the email please try another or reset the password' });
    } else {
      const user = new User(regData);
      if (regData.password) {
        user.hash = bcrypt.hashSync(regData.password, 10);
      }
      if (await user.save()) {
        res.status(200).json({ error: 'Registered succesfully!' });
      } else {
        res.status(500).json({ error: 'Internal server error occured' });
      };
    }
  }
}

exports.authentication = async (req, res, next) => {
  const lgnData = req.body
  if (await User.findOne({ email: lgnData.email, active: false })) {
    res.status(500).json({ errorStatus: true, message: "User is not Activated please contact admin department" })
  } else if (!(await User.findOne({ email: lgnData.email }))) {
    res.status(500).json({ errorStatus: true, message: "There is no sufficient user in the system" })
  };
  const user = await User.findOne({ email: lgnData.email });
  if (user.active == true) {
    if (user && bcrypt.compareSync(lgnData.password, user.hash)) {
      const { hash, ...userWithoutHash } = user.toObject();
      const token = jwt.sign({ sub: user._id }, config.secret);
      res.status(200).json({
        ...userWithoutHash,
        token,
        errorStatus: false,
      });
    } else {
      res.status(500).json({ errorStatus: true, message: "Inserted password is incorrect,Please enter the correct password" })
    }
  }
}

exports.newPassword = async (req, res, next) => {
  passwordResetToken.findOne({ resettoken: req.body.resettoken }, function (err, userToken, next) {
    if (!userToken) {
      return res
        .status(409)
        .json({ message: 'Token has expired' });
    }

    User.findOne({
      _id: userToken._userId
    }, function (err, userEmail, next) {
      // console.log(userEmail)
      if (!userEmail) {
        return res
          .status(409)
          .json({ message: 'User does not exist' });
      }

      return bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
        if (err) {
          return res
            .status(400)
            .json({ message: 'Error hashing password' });
        }
        userEmail.hash = hash;
        userEmail.save(function (err) {
          if (err) {
            return res
              .status(400)
              .json({ message: 'Password can not reset.' });
          } else {
            userToken.remove();
            return res
              .status(201)
              .json({ message: 'Password reset successfully' });
          }

        });
      });
    });

  })
}

exports.reqPassword = async (req, res, next) => {
  const values = req.body;
  console.log(req.body)
  const user = await User.findOne({
    email: values.email,
  });
  //console.log(user)
  //console.log(user);
  var resettoken = new passwordResetToken({
    _userId: user._id,
    resettoken: crypto.randomBytes(16).toString("hex"),
  });
  resettoken.save(function (err) {
    if (err) {
      return;
    }
    passwordResetToken
      .find({ _userId: user._id, resettoken: { $ne: resettoken.resettoken } })
      .remove()
      .exec();
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    var mailOptions = {
      to: user.email,
      from: "your email",
      subject: "FLYAUDIT Reset Your Password",
      text: `HI HI`,
      html: `<!DOCTYPE html>
      <html>
      <head>
      
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Password Reset</title>
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
                <tr>
                  <td align="center" valign="top" style="padding: 36px 24px;">
                    
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
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1>
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
                    <p style="margin: 0;">Tap the button below to reset your customer account password. If you didn't request a new password, you can safely delete this email.</p>
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
                                <a href="${config.routemain + resettoken.resettoken}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Do Something Sweet</a>
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
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                    <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                    <p style="margin: 0;">
                    
                    <a href="${config.routemain + resettoken.resettoken}" target="_blank">${config.routemain + resettoken.resettoken}</a></p>
                  </td>
                </tr>
                <!-- end copy -->
      
                <!-- start copy -->
                <tr>
                  <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                    <p style="margin: 0;">Cheers,<br> Admin</p>
                  </td>
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
      
                <!-- start permission -->
                <tr>
                  <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                    <p style="margin: 0;">You received this email because we received a request for password is not correct for your account. If you didn't request password is not correct you can safely delete this email.</p>
                  </td>
                </tr>
                <!-- end permission -->
      
                <!-- start unsubscribe -->
                <tr>
                  <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                    <p style="margin: 0;">To stop receiving these emails, you can ignore at any time.</p>
                    <p style="margin: 0;">Paste 1234 S. Broadway St. City, State 12345</p>
                  </td>
                </tr>
                <!-- end unsubscribe -->
      
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
      </html>`,// html body



    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json("email is send");
      }
    });
  });




}


exports.updateProject = async (req, res, next) => {

  const _collection = req.body.collection.replace(/\s+/g, "-");
  if (req.body == undefined) {
    res.status(409).json({ error: errors.array() });
    return;
  } else {
    const { id: _id } = req.params;

    MongoClient.connect(url, function (err, db) {
      if (err) {
        res.status(500).json({ err });
      }
      var dbo = db.db(config.dbName);
      // console.log(req.body.formGroup);
      dbo
        .collection(_collection)
        .updateOne(
          { _id: ObjectID(_id) },
          { $set: req.body.formGroup },
          function (err, result) {
            if (err) {
              res.status(500).json(err);
            } else {
              dbo.collection(_collection).updateOne(
                { _id: ObjectID(_id) },
                { $set: { "customDeadline": req.body.deadlineNumber } },
                function (err, final) {
                  if (!err) {
                    res.status(200).json("updated");
                  }
                }
              )

            }
          }
        );


      //     toArray(function (err, docs) {
      //
      // });
    });

    // const update=await Project.findByIdAndUpdate(_id,updateProjectData,{new:true});
    // res.send(update);
  }
};

exports.updatecorrectiveAction = async (req, res, next) => {

  const _collection = req.body.collection.replace(/\s+/g, "-");
  const _status = (req.body.actionStatus == 1) ? 2 : 1

  // console.log(req.body)

  MongoClient.connect(url, function (err, db) {
    if (err) {
      res.status(500).json({ err });
    }
    var dbo = db.db(config.dbName);
    dbo
      .collection(_collection)
      .updateOne(
        { _id: ObjectID(req.body._id) },
        {
          $set: {
            status: String(_status)
          }
        },
        function (err, result) {
          if (err) {
            res.status(500).json(err);
          } else {
            res.status(200).json("Status update Done");
          }
        }
      );
    //     toArray(function (err, docs) {
    //
    // });
  });

  return;
  if (req.body) {
    var _updateStatus = req.body.actionStatus;
    console.log(_updateStatus);
    var _id = req.body._id;
    const update = await Project.updateOne(
      { _id: _id },
      {
        $set: {
          status: _updateStatus,
        },
      },
      function (error, result) {
        if (error) {
          res.status(500).json(error);
        } else {
          res.status(200).json("Status update Done");
        }
      }
    );
  } else {
    res.status(409).json({ error: errors.array() });
  }
};
// function updateUser(req ,res ,next){
//     //  console.log(req.body);
//       userService.updateByUserId(req.body)
//           .then(() => {
//            res.status(200)
//        .json(1);
//    })
//           .catch((err) => {
//               console.log('Error ekak enwa')
//                  return res.status(500).send({ msg: 'You have and internal server error' });next(err)});
//   }
