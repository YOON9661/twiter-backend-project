module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define("Image", {
        Imagepath: {
            type: DataTypes.STRING(300),
            allowNull: false
        }
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci"
    });
    Image.associate = (db) => {
        db.Image.belongsTo(db.User);
        db.Image.belongsTo(db.Post);
    }
    return Image;
};