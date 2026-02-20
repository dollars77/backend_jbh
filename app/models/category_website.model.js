module.exports = (sequelize, Sequelize) => {
    const Category_website = sequelize.define("category_website", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },


    }, {
        timestamps: false,
        updatedAt: false
    });
    return Category_website;
};