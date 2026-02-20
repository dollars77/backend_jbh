const { authJwt } = require("../middleware");

module.exports = (app) => {
    const website = require("../controllers/website.controller");


    var router = require("express").Router();

    router.get('/allWebsite', authJwt.verifyTokenHeader, website.getAllWebsite);
    router.get('/allWebsiteInCategory/:id',authJwt.verifyTokenHeader,website.getAllWebsiteInCategory)
    router.get('/allWebsiteInCategoryAdmin/:id',authJwt.verifyTokenHeader,website.getAllWebsiteInCategoryAdmin)
    router.get('/allWebsiteOrderall',authJwt.verifyTokenHeader,website.getAllWebsiteOrder_All)
    router.post('/addWebsite', authJwt.verifyTokenHeader, website.uploadimage, website.createWebsite);
    router.put('/updateWebsite', authJwt.verifyTokenHeader, website.uploadimage, website.updateWebsite);

    router.put('/updateOrderWebsite',authJwt.verifyTokenHeader,website.updateOrderWebsite)
    router.put('/updateOrderWebsiteAll',authJwt.verifyTokenHeader,website.updateOrderWebsiteAll)

    router.delete('/deleteWebsite/:id', authJwt.verifyTokenHeader, website.deleteWebsite);
    router.post('/deleteimagepc', authJwt.verifyTokenHeader, website.deleteImagePc);
    router.post('/deleteimagemobile', authJwt.verifyTokenHeader, website.deleteImageMobile);

    router.get('/getAllWebsiteUser',website.getAllWebsiteUser)
    router.post('/getWebsite_URL',website.GetWebsite_URL)





    app.use("/api/website", router);

}