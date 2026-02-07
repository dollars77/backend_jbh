module.exports = (sequelize, Sequelize) => {
    const category = sequelize.define("category", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        iconcategory: {
            type: Sequelize.STRING,
            defaultValue: null,
        },
        namecategory: {
            type: Sequelize.STRING
        },
        order: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },

    }, { timestamps: false });
    return category;
};