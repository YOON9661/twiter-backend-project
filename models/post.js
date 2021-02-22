module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define("Post", {
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING(250),
            allowNull: true
        }
    });
    Post.associate = (db) => {
        db.Post.belongsTo(db.User);
        db.Post.belongsToMany(db.User, { through: "PostLike", as: "PostLiker" });
        db.Post.hasMany(db.Comment);
    };
    return Post;
}