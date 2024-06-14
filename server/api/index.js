const express = require('express');
const controller = require('./api.controller');
const multer = require("multer");
const AWS = require('aws-sdk');
const router = express.Router();

var storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var multipleUpload = multer({ storage: storage }).single('file');
var multipleUploads = multer({ storage: storage }).array('file');

router.post("/upload-image",multipleUploads,controller.uploadImage)
router.post('/upload-file',multipleUpload,controller.uploadfile)
router.post('/send-buffer-data',multipleUpload,controller.sendbase64Image)


module.exports = router;