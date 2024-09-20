const express = require("express");
const router = express.Router();
const {geturl}=require("../controller/twitterController")
const {getsCryptoGodsUrl,getmenu,getHeading}=require("../controller/categoryController")
const {login,addUserDetails,getUser,editUser,DeleteUser}=require("../controller/adminController")
const {addCategory,getCategoryDetails,editCategory,deleteCategory,getCategoryparentDetails}=require("../controller/adminController")

//fetch all tweets urls for homepage
router.get("/getUrl",geturl)

//fetch dynamically  menu items based on database category 1 only for submenu
router.get("/getmenu",getmenu)

//fetch dynamically fetch menu and submenu based on name and id
router.get("/getHeading",getHeading)

//fetch cryptoGods  user tweets urls
router.get("/getsCryptoGodsUrl",getsCryptoGodsUrl)

//---------------------routes for admin and category controllers--------------------------
router.post("/adminLogin",login)
router.post('/addUserDetails',addUserDetails)
router.get('/getUserDetails',getUser)
router.put('/editUserDetails/:id',editUser)
router.patch('/deleteUserDetails/:id',DeleteUser)

//---------------------routes for category controllers------------------------
router.post("/addCategory",addCategory)
router.get('/getCategoryDetails',getCategoryDetails)
router.put('/editCategory/:id',editCategory)
router.patch('/deleteCategory/:id',deleteCategory)
router.get('/getparent',getCategoryparentDetails)

router.get('/test-me', function (req, res) {
    res.send({ status: true, message: "test-api working fine" })
})







module.exports = router;