-- Create department table
CREATE TABLE department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Create role table
CREATE TABLE role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT REFERENCES department(id)
);

-- Create employee table
CREATE TABLE employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role_id INT REFERENCES role(id),
  manager_id INT REFERENCES employee(id)
);
