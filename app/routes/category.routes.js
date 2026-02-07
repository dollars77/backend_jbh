const { authJwt } = require("../middleware");

module.exports = (app) => {
    const category = require("../controllers/category.controller");


    var router = require("express").Router();

    router.post('/addCategory', authJwt.verifyTokenHeader, category.uploadimage, category.createCategory);
    router.put('/updateCategory', authJwt.verifyTokenHeader, category.uploadimage, category.updateCategory);
    router.put('/updateOrder',authJwt.verifyTokenHeader,category.updateOrderCategory)
    router.get('/allCategory', authJwt.verifyTokenHeader, category.getAllCategory);
    router.get('/oneCategory/:id',authJwt.verifyTokenHeader, category.getOneCategory)
    router.delete('/deleteCategory/:id', authJwt.verifyTokenHeader, category.deleteCategory);
    router.post('/deleteiconcategory', authJwt.verifyTokenHeader, category.deleteIconCategory);

    router.get('/allCategoryUser', category.getAllCategoryUser);


    app.use("/api/category", router);

}