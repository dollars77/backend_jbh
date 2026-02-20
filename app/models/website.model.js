module.exports = (sequelize, Sequelize) => {
    const website = sequelize.define("website", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        imagepc: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
        imagemobile: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
        websitename: {
            type: Sequelize.STRING
        },
        websiteurl: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        price: {
            type: Sequelize.FLOAT(11, 2),
            defaultValue: 0.0,
        },
        order: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        order_all: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },
        cover: {
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },
        categoryId: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
    }, { timestamps: false });
    return website;
};