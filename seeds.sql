USE company;

INSERT INTO departments (name)
VALUES
  ('Engineering'),
  ('Finance'),
  ('Human Resources');

INSERT INTO roles (title, salary, department_id)
VALUES
  ('Software Engineer', 80000, 1),
  ('Accountant', 60000, 2),
  ('HR Manager', 75000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
  ('John', 'Doe', 1, NULL),
  ('Jane', 'Smith', 2, NULL),
  ('Emily', 'Davis', 3, NULL);
