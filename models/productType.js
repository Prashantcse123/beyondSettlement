module.exports = (sequelize, DataTypes) => {
  const ProductType = sequelize.define('ProductType', {
    name: DataTypes.STRING,
  });

  ProductType.associate = function (models) {
    models.ProductType.hasMany(models.CreditorOverride, {foreignKey: 'productTypeId'});
  };

  return ProductType;
};
