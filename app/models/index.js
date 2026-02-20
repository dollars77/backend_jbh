const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    
    dialectOptions: {
      useUTC: false, // for reading from database
    },
    timezone: '+07:00', // for writing to database
  }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/roles.model.js")(sequelize, Sequelize);

db.people = require("../models/people.model.js")(sequelize, Sequelize);
db.weburl = require("../models/weburl.model.js")(sequelize, Sequelize);
db.category = require("../models/category.model.js")(sequelize, Sequelize);
db.website = require("../models/website.model.js")(sequelize, Sequelize);

db.category_website = require("../models/category_website.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});
db.category.hasMany(db.category_website,{foreignKey:{name:'categoryId',allowNull:false},onDelete:'RESTRICT'});
db.category_website.belongsTo(db.category,{foreignKey:{name:'categoryId',allowNull:false},onDelete:'RESTRICT'});

db.website.hasMany(db.category_website,{foreignKey:{name:'websiteId',allowNull:false},onDelete:'RESTRICT'});
db.category_website.belongsTo(db.website,{foreignKey:{name:'websiteId',allowNull:false},onDelete:'RESTRICT'});

db.website.belongsToMany(db.category,{
  through:{
  model:db.category_website,
  as: "category",
  unique: false,
  // onDelete:'restrict'
  },foreignKey:"websiteId",
})
db.category.belongsToMany(db.website,{
  through:{
  model:db.category_website,
  as: "website",
  unique: false,
  // onDelete:'restrict'
  },foreignKey:"categoryId",
})






db.ROLES = ["user", "admin", "mod"];






module.exports = db;