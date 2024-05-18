const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'company'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database.');
  startApp();
});

const startApp = () => {
  inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit'
    ]
  })
  .then(answer => {
    switch (answer.action) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addDepartment();
        break;
      case 'Add a role':
        addRole();
        break;
      case 'Add an employee':
        addEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        connection.end();
        break;
      default:
        console.log(`Invalid action: ${answer.action}`);
        startApp();
        break;
    }
  });
};

const viewDepartments = () => {
  const query = 'SELECT * FROM departments';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
};

const viewRoles = () => {
  const query = `
    SELECT roles.id, roles.title, departments.name AS department, roles.salary
    FROM roles
    INNER JOIN departments ON roles.department_id = departments.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
};

const viewEmployees = () => {
  const query = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON employees.manager_id = manager.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
};

const addDepartment = () => {
  inquirer.prompt({
    name: 'name',
    type: 'input',
    message: 'Enter the name of the department:'
  })
  .then(answer => {
    const query = 'INSERT INTO departments (name) VALUES (?)';
    connection.query(query, answer.name, (err, res) => {
      if (err) throw err;
      console.log(`Department ${answer.name} added successfully.`);
      startApp();
    });
  });
};

const addRole = () => {
  connection.query('SELECT * FROM departments', (err, departments) => {
    if (err) throw err;

    inquirer.prompt([
      {
        name: 'title',
        type: 'input',
        message: 'Enter the title of the role:'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'Enter the salary for the role:'
      },
      {
        name: 'department_id',
        type: 'list',
        message: 'Select the department for the role:',
        choices: departments.map(department => ({
          name: department.name,
          value: department.id
        }))
      }
    ])
    .then(answer => {
      const query = 'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)';
      connection.query(query, [answer.title, answer.salary, answer.department_id], (err, res) => {
        if (err) throw err;
        console.log(`Role ${answer.title} added successfully.`);
        startApp();
      });
    });
  });
};

const addEmployee = () => {
  connection.query('SELECT * FROM roles', (err, roles) => {
    if (err) throw err;
    connection.query('SELECT * FROM employees', (err, employees) => {
      if (err) throw err;

      inquirer.prompt([
        {
          name: 'first_name',
          type: 'input',
          message: 'Enter the first name of the employee:'
        },
        {
          name: 'last_name',
          type: 'input',
          message: 'Enter the last name of the employee:'
        },
        {
          name: 'role_id',
          type: 'list',
          message: 'Select the role for the employee:',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        },
        {
          name: 'manager_id',
          type: 'list',
          message: 'Select the manager for the employee (select None if no manager):',
          choices: [
            { name: 'None', value: null },
            ...employees.map(employee => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id
            }))
          ]
        }
      ])
      .then(answer => {
        const query = 'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
        connection.query(query, [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], (err, res) => {
          if (err) throw err;
          console.log(`Employee ${answer.first_name} ${answer.last_name} added successfully.`);
          startApp();
        });
      });
    });
  });
};

const updateEmployeeRole = () => {
  connection.query('SELECT * FROM employees', (err, employees) => {
    if (err) throw err;
    connection.query('SELECT * FROM roles', (err, roles) => {
      if (err) throw err;

      inquirer.prompt([
        {
          name: 'employee_id',
          type: 'list',
          message: 'Select the employee whose role you want to update:',
          choices: employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        },
        {
          name: 'role_id',
          type: 'list',
          message: 'Select the new role for the employee:',
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        }
      ])
      .then(answer => {
        const query = 'UPDATE employees SET role_id = ? WHERE id = ?';
        connection.query(query, [answer.role_id, answer.employee_id], (err, res) => {
          if (err) throw err;
          console.log(`Employee's role updated successfully.`);
          startApp();
        });
      });
    });
  });
};
