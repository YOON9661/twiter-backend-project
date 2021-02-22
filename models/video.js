module.exports = (sequelize, DataTypes) => {
    const Video = sequelize.define("Video", {
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        imagepath: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        videopath: {
            type: DataTypes.STRING(300),
            allowNull: false
        }
    }, {
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci"
    });
    Video.associate = (db) => {
        db.Video.belongsTo(db.User);
        db.Video.hasMany(db.Comment);
        db.Video.belongsToMany(db.User, { through: "VideoLike", as: "VideoLikers" });
        db.Video.belongsToMany(db.User, { through: "VideoDisike", as: "VideoDislikers" });
    }
    return Video;
};