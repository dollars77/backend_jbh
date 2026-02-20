const db = require("../models");
const category = db.category;
const website = db.website;
const category_website = db.category_website;

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { Op } = require("sequelize");
const axios = require('axios');

const fileStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var upload_test = multer({
  storage: fileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 1 MB
  fileFilter: fileFilter,
}).fields([
  { name: "imagepc", maxCount: 1 },
  { name: "imagemobile", maxCount: 1 }
]);

exports.uploadimage = upload_test;


exports.getAllWebsite = async (req, res) => {
  website
    .findAll({ where: { categoryId: req.params.id }, order: [["order_All", "ASC"]], },)
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

exports.getAllWebsiteInCategory = async (req, res) => {
  website
    .findAll({ where: { categoryId: req.params.id }, order: [["order", "DESC"]], },

    )
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
exports.getAllWebsiteInCategoryAdmin = async (req, res) => {
  category_website
    .findAll({
      include: [
        {
          model: website,
          as: "website",
          include: [
            {
              model: category_website,
              as: "category_websites",
            },]
        },
      ], where: { categoryId: req.params.id }, order: [["order", "DESC"]],
    },

    )
    .then((data) => {
      const result = data.map((row) => {
        const r = row.toJSON();

        return {
          ...r.website,
          order: r.order,
          category_websiteId: r.id,
          categoryId: r.categoryId,

        };
      });

      res.send(result);
    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};
exports.getAllWebsiteOrder_All = async (req, res) => {
  await website
    .findAll({
      include: [
        {
          model: category_website,
          as: "category_websites",
          include: [
            {
              model: category,
              as: "category",

            },

          ],
        },
      ],
      order: [["order_all", "DESC"]],
    },

    )
    .then((data) => {
      console.log(JSON.stringify(data));
      res.send(data);


    })
    .catch((err) => {
      res.status(500).send({
        status: 500,
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};
exports.getAllWebsiteUser = async (req, res) => {
  website
    .findAll({
      where: { status: 1 },
      order: [["order_all", "DESC"]],
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


exports.createWebsite = async (req, res) => {

  if (req.body == null) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  website
    .findOne({ where: { websitename: req.body.websitename } })
    .then(async (user) => {
      if (user) {
        res.status(400).send({
          status: 400,
          message: "Failed! websitename is already in use!",
        });
        return;
      }
      var data_website = {};
      const countwebsite = await website.count({ where: { categoryId: req.body.categoryId } });
      const countwebsiteAll = await website.count();

      var imagepctxt = null;
      var imagemobiletxt = null;


      try {

        const file = req.files.imagepc[0];
        const baseName = Date.now();
        const outputPath = path.resolve("./app/images/size_pc/resized", baseName + ".png");

        await sharp(file.buffer)

          .resize(1280, Math.round(1280 / (16 / 9)), {
            fit: "cover",
            position: "top",
          })
          .png({ quality: 80 }) // แปลงเป็น png เสมอ
          .toFile(outputPath);

        try {
          imagepctxt =
            "app\\images\\size_pc\\resized\\" + baseName + ".png";
        } catch (err) {
          imagepctxt = null;
        }


      } catch (err) {
        console.error("Error processing image:", err);
      }

      try {
        const file = req.files.imagemobile[0]; // multer เก็บ buffer ที่นี่
        const baseName = Date.now();       // ตั้งชื่อไฟล์ใหม่
        const outputPath = path.resolve("./app/images/size_mobile/resized", baseName + ".png");

        await sharp(file.buffer)
          .resize(800, Math.round(800 / (10 / 16)), {
            fit: "contain",
            position: "top", // จริงๆ contain ไม่ค่อยมีผลกับ position เท่า cover แต่ใส่ไว้ได้
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // โปร่งใส
          })
          .png({ quality: 80 })
          .toFile(outputPath);


        try {
          imagemobiletxt =
            "app\\images\\size_mobile\\resized\\" + baseName + ".png";

        } catch (err) {
          imagemobiletxt = null;
        }


      } catch (err) {
        console.error("Error processing image:", err);
      }

      //************************************************************ */



      //************************************************************ */

      try {
        data_website = {
          imagepc: imagepctxt,
          imagemobile: imagemobiletxt,
          websitename: req.body.websitename,
          websiteurl: req.body.websiteurl,
          description: req.body.description,
          price: 0,
          categoryId: null,
          status: req.body.status,
          cover: req.body.cover,
          order: countwebsite + 1,
          order_all: countwebsiteAll + 1,


        };
      } catch (err) { }



      return await website
        .create(data_website)
        .then(async (data) => {

          const category_arr = JSON.parse(req.body.categoryId);
          await category_arr.map(async (categoryId) => {
            let maxValue = 0;
            try {
              maxValue = await category_website.max('order', {
                where: { categoryId: categoryId }
              });
            } catch (error) {
            }
            const maxValueCheck = maxValue ? maxValue + 1 : 1;
            await category_website
              .create({
                order: maxValueCheck,
                categoryId: categoryId,
                websiteId: data.id
              })
          })

          res.status(200).send({ status: true, id: data.id });
        })
        .catch((err) => {
          res.status(500).send({
            status: 500,
            message:
              err.message || "Some error occurred while creating the Website.",
          });
        });
    });
};

exports.updateWebsite = async (req, res) => {

  try {
    if (req.body.checkimagepc === "true") {
      try {
        const file = req.files.imagepc[0]; // multer เก็บ buffer ที่นี่
        const baseName = Date.now();       // ตั้งชื่อไฟล์ใหม่
        const outputPath = path.resolve("./app/images/size_pc/resized", baseName + ".png");
        var imagepctxt = null;

        await sharp(file.buffer)
          .resize(1280, Math.round(1280 / (16 / 9)), {
            // .resize(1920, Math.round(1920 / (16 / 9)), {
            //  .resize(1920, Math.round(1920 / 3), { 
            fit: "cover",
            position: "top",
          })
          .png({ quality: 80 }) // แปลงเป็น png เสมอ
          .toFile(outputPath);

        try {
          imagepctxt =
            "app\\images\\size_pc\\resized\\" + baseName + ".png";
        } catch (err) {
          imagepctxt = null;
        }


      } catch (err) {
        console.error("Error processing image:", err);
      }

      await website.update({ imagepc: imagepctxt }, { where: { id: req.body.id } });
    }

    if (req.body.checkimagemobile === "true") {

      try {
        const file = req.files.imagemobile[0]; // multer เก็บ buffer ที่นี่
        const baseName = Date.now();       // ตั้งชื่อไฟล์ใหม่
        const outputPath = path.resolve("./app/images/size_mobile/resized", baseName + ".png");
        var imagemobiletxt = null;

        await sharp(file.buffer)
          .resize(800, Math.round(800 / (10 / 16)), {
            fit: "contain",
            position: "top", // จริงๆ contain ไม่ค่อยมีผลกับ position เท่า cover แต่ใส่ไว้ได้
            background: { r: 0, g: 0, b: 0, alpha: 0 }, // โปร่งใส
          })
          .png({ quality: 80 })
          .toFile(outputPath);


        try {
          imagemobiletxt =
            "app\\images\\size_mobile\\resized\\" + baseName + ".png";

        } catch (err) {
          imagemobiletxt = null;
        }


      } catch (err) {
        console.error("Error processing image:", err);
      }
      await website.update({ imagemobile: imagemobiletxt }, { where: { id: req.body.id } });
    }

    const data_website = {
      websitename: req.body.websitename,
      websiteurl: req.body.websiteurl,
      description: req.body.description,
      price: req.body.price,
      status: req.body.status,
      cover: req.body.cover,
      categoryId: req.body.categoryId,
    };

    await website.update(data_website, { where: { id: req.body.id } });
    const category_arr = JSON.parse(req.body.categoryId);
    const category_arrOld = JSON.parse(req.body.categoryIdOld);
    if (req.body.checkCategory === "false") {
      await category_website
        .destroy({
          where: { websiteId: req.body.id },
        })

      await category_arr.map(async (categoryId) => {
        let maxValue = 0;
        try {
          maxValue = await category_website.max('order', {
            where: { categoryId: categoryId }
          });
        } catch (error) {
        }
        const maxValueCheck = maxValue ? maxValue + 1 : 1;
        await category_website
          .create({
            order: maxValueCheck,
            categoryId: categoryId,
            websiteId: req.body.id
          })
      })
    }


    res.status(200).send({
      message: "website was updated successfully."
    });
  } catch (e) {
    res.status(500).send({
      status: 500,
      message: "Error updating website "
    });
  }
}

exports.updateOrderWebsite = async (req, res) => {
  const website_data = req.body;
  try {
    await website_data.map(async (data) =>
      await category_website.update(
        { order: data.order },
        {
          where: { id: data.category_websiteId },

        }
      )
    );
    res.status(200).send({ status: true });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: error.message || "Some error occurred while retrieving game_data",
    });
  }

};
exports.updateOrderWebsiteAll = async (req, res) => {
  const website_data = req.body;
  try {
    await website_data.map(async (data) =>
      await website.update(
        { order_all: data.order_all },
        {
          where: { id: data.id },

        }
      )
    );
    res.status(200).send({ status: true });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: error.message || "Some error occurred while retrieving game_data",
    });
  }

};


exports.deleteWebsite = async (req, res) => {
  const id = req.params.id;
  try {
    await category_website
      .destroy({
        where: { websiteId: id },
      })

    await website
      .destroy({
        where: { id: id },
      })
    res.status(200).send({
      message: "website was deleted successfully!",
    });
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: "Could not delete website",
    });
  }
};

exports.deleteImagePc = async (req, res) => {
  const filePath = req.body.imagepcBackup;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    if (req.body.id !== null) {
      await website
        .update(
          { imagepc: null },
          {
            where: { id: req.body.id },
          }
        )
        .then((num) => {
          return res.send({
            message: "imagepc was delete successfully.",
          });
        })
        .catch((err) => {
          return res.status(500).send({
            status: 500,
            message: "Error delete imagepc ",
          });
        });
    } else {
      res.status(200).send({ status: true });
    }

  });
  return;
};
exports.deleteImageMobile = async (req, res) => {
  const filePath = req.body.imagemobileBackup;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    if (req.body.id !== null) {
      await website
        .update(
          { imagemobile: null },
          {
            where: { id: req.body.id },
          }
        )
        .then((num) => {
          return res.send({
            message: "imagemobile was delete successfully.",
          });
        })
        .catch((err) => {
          return res.status(500).send({
            status: 500,
            message: "Error delete imagemobile ",
          });
        });
    } else {
      res.status(200).send({ status: true });
    }

  });
  return;
};


exports.GetWebsite_URL = async (req, res) => {
  try {
    const url = req.body.url;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Proxying request to: ${url}`);

    // ดึงเนื้อหาจากเว็บเป้าหมาย
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000, // 15 seconds timeout
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept 4xx responses
    });

    let html = response.data;

    // แก้ไข relative URLs
    const baseUrl = new URL(url).origin;
    const fullBaseUrl = new URL(url).href.replace(/\/[^\/]*$/, '');

    // Fix relative URLs
    html = html.replace(/href="\/([^"]*)"/g, `href="${baseUrl}/$1"`);
    html = html.replace(/src="\/([^"]*)"/g, `src="${baseUrl}/$1"`);
    html = html.replace(/href="(?!http|https|#|javascript:|mailto:)([^"]*)"/g, `href="${fullBaseUrl}/$1"`);
    html = html.replace(/src="(?!http|https|data:|javascript:)([^"]*)"/g, `src="${fullBaseUrl}/$1"`);

    // เพิ่ม CSS เพื่อป้องกันการคลิก
    const disableInteractionCSS = `
      <style>
        /* ป้องกันการคลิก แต่ยังให้เลื่อนได้ */
        a, button, input, select, textarea, form {
          pointer-events: none !important;
          cursor: default !important;
        }
        
        /* ป้องกันการเปิด popup/modal */
        [onclick], [onmousedown], [onmouseup] {
          pointer-events: none !important;
        }
        
        /* แต่ยังให้เลื่อนได้ */
        body, html {
          overflow: auto !important;
          scroll-behavior: smooth;
        }
        
        /* แสดงให้เห็นว่าคลิกไม่ได้ */
        a:hover, button:hover {
          opacity: 0.7 !important;
          text-decoration: none !important;
        }
        
        /* ป้องกัน text selection */
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      </style>
    `;

    // แทรก CSS ก่อน </head>
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${disableInteractionCSS}</head>`);
    } else {
      // ถ้าไม่มี head tag ให้เพิ่มที่ต้นเอกสาร
      html = `${disableInteractionCSS}${html}`;
    }


    // ส่งกลับเป็น HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.send(html);

  } catch (error) {
    console.error('Proxy error:', error.message);

    // Handle different types of errors
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ error: 'Website not found or DNS error' });
    }
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Connection refused by target server' });
    }
    if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      return res.status(status).json({
        error: `HTTP ${status}: ${statusText}`
      });
    }

    res.status(500).json({
      error: 'Failed to fetch website content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};