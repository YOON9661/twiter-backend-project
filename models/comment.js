module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define("Comment", {
        content: {
            type: DataTypes.STRING(300),
            allowNull: false
        }
    });
    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
        db.Comment.belongsTo(db.Video);
    }
    return Comment;
}