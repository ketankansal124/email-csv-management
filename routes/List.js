const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {addList,addUsers,sendMail,unsubscribe}=require("../controllers/List");

router.post("/",addList);

router.post("/:id/users",upload.single('file'),addUsers);
router.post('/:id/email',sendMail);
router.get('/unsubscribe/:token', unsubscribe);

module.exports = router;