-- Create department table
CREATE TABLE IF NOT EXISTS department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

-- Create role table
CREATE TABLE IF NOT EXISTS role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50) NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INT REFERENCES department(id)
);

-- Create employee table
CREATE TABLE IF NOT EXISTS employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role_id INT REFERENCES role(id),
  manager_id INT REFERENCES employee(id)
);

-- Insert initial data into department table
INSERT INTO department (name) VALUES ('Sales'), ('Engineering'), ('Finance');

-- Insert initial data into role table
INSERT INTO role (title, salary, department_id) VALUES
('Sales Manager', 60000, 1),
('Software Engineer', 80000, 2),
('Accountant', 55000, 3);

-- Insert initial data into employee table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Emily', 'Davis', 3, NULL);
