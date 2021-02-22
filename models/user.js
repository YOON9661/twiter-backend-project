module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        // id가 기본적으로 들어감
        email: {
            type: DataTypes.STRING(30),
            allowNull: false, // 필수
            unique: true // 고유한 값
        },
        nickname: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        charset: "utf8",
        collate: "utf8_general_ci"
    });
    User.associate = (db) => {
        db.User.belongsToMany(db.User, { through: "Subscribe", as: "Subscribings", foreignKey: "SubscribedId" });
        db.User.belongsToMany(db.User, { through: "Subscribe", as: "Subscribers", foreignKey: "SubscribingId" });
        db.User.belongsToMany(db.Video, { through: "VideoLike", as: "VideoLikings" });
        db.User.belongsToMany(db.Video, { through: "VideoDisike", as: "VideoDislikings" });
        db.User.belongsToMany(db.Post, { through: "PostLike", as: "PostLiking" });
        db.User.hasMany(db.Video);
        db.User.hasMany(db.Post);
        db.User.hasMany(db.Comment);
    };
    return User;
}