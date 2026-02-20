const db = require("../models");
const category = db.category;
const website = db.website;

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { Op } = require("sequelize");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // setting destination of uploading files
    // if uploading resume
    if (file.fieldname === "iconcategory") {
      cb(null, "./app/images/icon");
    }
  },
  filename: (req, file, cb) => {
    // naming file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  // if uploading resume
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    // check file type to be pdf, doc, or docx
    cb(null, true);
  } else {
    cb(null, false); // else fails
  }
};

var upload_test = multer({
  storage: fileStorage,
  limits: {
    fileSize: "1048576",
  },
  fileFilter: fileFilter,
}).fields([

  {
    name: "iconcategory",
    maxCount: 1,
  }

]);
exports.uploadimage = upload_test;

exports.createCategory = async (req, res) => {

  if (req.body == null) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  category
    .findOne({ where: { namecategory: req.body.namecategory } })
    .then(async (user) => {
      if (user) {
        res.status(400).send({
          status: 400,
          message: "Failed! Namecategory is already in use!",
        });
        return;
      }
      var data_category = {};
      const countcategory = await category.count();
      try {


        const targetWidth = 512; // หรือ 1280, 1600 ตามต้องการ
        const targetHeight = Math.round(targetWidth / (1 / 1)); // คำนวณความสูงให้เป็น 16:9

        let sharpInstance = sharp(req.files.iconcategory[0].path)
          .resize(targetWidth, targetHeight, {
            fit: 'cover', // ครอปรูปให้พอดีกับขนาดที่กำหนด
            position: 'center' // ครอปจากตรงกลาง
          });

        if (path.extname(req.files.iconcategory[0].originalname).toLowerCase() === '.webp') {
          sharpInstance = sharpInstance.webp();

        } else {
          sharpInstance = sharpInstance.png({ quality: 80 });
          await sharpInstance.toFile(
            path.resolve(
              req.files.iconcategory[0].destination,
              "resized",
              req.files.iconcategory[0].filename
            )
          );
          fs.unlinkSync(req.files.iconcategory[0].path);
        }
      } catch (err) { }
      //************************************************************ */

      var iconcategorytxt = null;

      try {
        if (path.extname(req.files.iconcategory[0].originalname).toLowerCase() === '.webp') {
          iconcategorytxt =
            "app\\images\\icon\\" +
            req.files.iconcategory[0].filename;
        } else {
          iconcategorytxt =
            "app\\images\\icon\\resized\\" +
            req.files.iconcategory[0].filename;
        }

      } catch (err) {
        iconcategorytxt = null;
      }
      //************************************************************ */

      try {
        data_category = {
          iconcategory: iconcategorytxt,
          namecategory: req.body.namecategory,
          namecategoryMM: req.body.namecategoryMM,
          status: req.body.status,
          order: countcategory + 1,


        };
      } catch (err) { }

      return await category
        .create(data_category)
        .then(async (data) => {
          res.status(200).send({ status: true, id: data.id });
        })
        .catch((err) => {
          res.status(500).send({
            status: 500,
            message:
              err.message || "Some error occurred while creating the Category.",
          });
        });
    });
};
exports.updateCategory = async (req, res) => {

  try {
    if (req.body.checkiconcategory === "true") {
      try {
        let sharpInstance = sharp(req.files.iconcategory[0].path);

        if (path.extname(req.files.iconcategory[0].originalname).toLowerCase() === '.webp') {
          sharpInstance = sharpInstance.webp();

        } else {
          sharpInstance = sharpInstance.png({ quality: 80 });
          await sharpInstance.toFile(
            path.resolve(
              req.files.iconcategory[0].destination,
              "resized",
              req.files.iconcategory[0].filename
            )
          );
          fs.unlinkSync(req.files.iconcategory[0].path);
        }
      } catch (err) { }

      var iconcategorytxt = null;

      try {
        if (path.extname(req.files.iconcategory[0].originalname).toLowerCase() === '.webp') {
          iconcategorytxt =
            "app\\images\\icon\\" +
            req.files.iconcategory[0].filename;
        } else {
          iconcategorytxt =
            "app\\images\\icon\\resized\\" +
            req.files.iconcategory[0].filename;
        }

      } catch (err) {
        iconcategorytxt = null;
      }
      await category.update({ iconcategory: iconcategorytxt }, { where: { id: req.body.id } });
    }

    const data_category = {
      namecategory: req.body.namecategory,
      namecategoryMM: req.body.namecategoryMM,
      status: req.body.status,
    };

    await category.update(data_category, { where: { id: req.body.id } });


    res.status(200).send({
      message: "Category was updated successfully."
    });
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Error updating Category "
    });
  }
}

exports.updateOrderCategory = async (req, res) => {
  const category_data = req.body;
  try {
    await category_data.map(async (data) =>
      await category.update(
        { order: data.order },
        {
          where: { id: data.id },

        }
      )
    );
    res.status(200).send({ status: true });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: error.message || "Some error occurred while retrieving camp_data.",
    });
  }

};

exports.getAllCategory = async (req, res) => {

  category
    .findAll({
      include: [
        {
          model: website,
          as: "websites",
          attributes: ["order"],
        },
      ],
      order: [["order", "ASC"]],
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getAllCategoryUser = async (req, res) => {
  try {
    const data = await category.findAll({
      include: [
        {
          model: website,
          as: "websites",
          where: { status: 1 },
          required: false, // LEFT JOIN: category ยังออกมา แม้ไม่มี website status=1
        },
      ],
      order: [
        ["order", "ASC"],
        [{ model: website, as: "websites" }, "order", "DESC"],
      ],
    });

    res.send(data);
  } catch (err) {
    res.status(500).send({
      status: 500,
      message: err.message || "Some error occurred while retrieving User.",
    });
  }
};

exports.getOneCategory = async (req, res) => {

  category
    .findOne(
      {
        // include: [
        //   {
        //     model: db.category_website,
        //     as: "category_websites",
        //   }], 
    where: { id: req.params.id }
      })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};
exports.deleteCategory = (req, res) => {
  const id = req.params.id;

  category
    .destroy({
      where: { id: id },
    })
    .then(() => {
      res.status(200).send({
        message: "Category was deleted successfully!",
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        message: "Could not delete Category",
      });
    });
};

exports.deleteIconCategory = async (req, res) => {
  const filePath = req.body.iconcategoryBackup;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    if (req.body.id !== null) {
      await category
        .update(
          { iconcategory: null },
          {
            where: { id: req.body.id },
          }
        )
        .then((num) => {
          return res.send({
            message: "IconCategory was delete successfully.",
          });
        })
        .catch((err) => {
          return res.status(500).send({
            status: 500,
            message: "Error delete IconCategory ",
          });
        });
    } else {
      res.status(200).send({ status: true });
    }

  });
  return;
};