const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  database: 'company'
});

async function createTables() {
  try {
    await client.connect();
    console.log('Database connected.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL
      );
    `);
    console.log('Created department table.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS role (
        id SERIAL PRIMARY KEY,
        title VARCHAR(50) NOT NULL,
        salary DECIMAL NOT NULL,
        department_id INT REFERENCES department(id)
      );
    `);
    console.log('Created role table.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS employee (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        role_id INT REFERENCES role(id),
      );
    `);
    console.log('Created employee table.');

  } catch (error) {
    console.error('Error creating tables', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

createTables();
