module.exports =(app)=>{
    const weburl = require("../controllers/weburl.controller");

    var router = require("express").Router();

    router.get('/get_social_link',weburl.get_social_link)


    app.use("/api/weburl",router);
    
}