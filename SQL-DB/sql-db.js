const {Sequelize, DataTypes, Model} = require('sequelize');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root'
});
connection.query(`CREATE DATABASE IF NOT EXISTS sdc`, (err, result) => {
  if (err) {
    console.log('CREATE DB Error:', err)
  } else {
    console.log('DB Created:', result)
  }
})

const sequelize = new Sequelize('sdc', 'root', '', {
  dialect: 'postgres',
  host: 'localhost'
});

const Reveiw = sequelize.define('Reveiw', {
  product_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reveiw_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recommend: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  response: {
    type: DataTypes.STRING
  },
  body: {
    type: DataTypes.CHAR(255)
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reviewer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  helpfulness: {
    type: DataTypes.INTEGER
  }
})



sequelize.authenticate()
  .then(() => {
    console.log('SDC SQL DB Connected!');
  })
  .catch((err) => {
    console.log('Failed to Connect to DB:', err);
  })