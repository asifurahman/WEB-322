const { Sequelize, DataTypes } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  dialectModule: pg,
  define: {
    timestamps: false 
  },
});

const Lego = sequelize.define('Lego', {
    set_num: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER 
    },
    // theme_id: {
    //     type: DataTypes.INTEGER 
    // },
    num_parts: {
        type: DataTypes.INTEGER 
    },
    img_url: {
        type: DataTypes.STRING
    }
});

const Theme = sequelize.define('Theme', {
  id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true 
  },
  name: {
      type: DataTypes.STRING,
      allowNull: false
  },
});

Lego.belongsTo(Theme, { foreignKey: 'theme_id' });


sequelize.sync({ force: true })
  .then(() => {
    console.log('Tables created successfully');
  })
  .catch(err => {
    console.error('Error creating tables:', err);
  });

module.exports = { sequelize, Lego, Theme };