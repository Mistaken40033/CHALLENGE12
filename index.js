const inquirer = require('inquirer');
const { Client } = require('pg');
const cTable = require('console.table');

// Define the PostgreSQL client with hardcoded credentials
const client = new Client({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  database: 'company'
});

client.connect()
  .then(() => {
    console.log('Database connected.');
    employeeTracker();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });

async function employeeTracker() {
  try {
    const { prompt } = await inquirer.prompt([
      {
        type: 'list',
        name: 'prompt',
        message: 'What would you like to do?',
        choices: [
          'View All Departments',
          'View All Roles',
          'View All Employees',
          'Add A Department',
          'Add A Role',
          'Add An Employee',
          'Update An Employee Role',
          'Log Out'
        ]
      }
    ]);

    switch (prompt) {
      case 'View All Departments':
        await viewAllDepartments();
        break;
      case 'View All Roles':
        await viewAllRoles();
        break;
      case 'View All Employees':
        await viewAllEmployees();
        break;
      case 'Add A Department':
        await addDepartment();
        break;
      case 'Add A Role':
        await addRole();
        break;
      case 'Add An Employee':
        await addEmployee();
        break;
      case 'Update An Employee Role':
        await updateEmployeeRole();
        break;
      case 'Log Out':
        await client.end();
        console.log("Good-Bye!");
        break;
      default:
        console.log('Invalid choice!');
        await employeeTracker();
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

// View all departments
async function viewAllDepartments() {
  try {
    const result = await client.query('SELECT * FROM department');
    console.log("Viewing All Departments:");
    console.table(result.rows);
    await employeeTracker();
  } catch (error) {
    console.error('Error viewing departments', error);
  }
}

// View all roles
async function viewAllRoles() {
  try {
    const result = await client.query('SELECT * FROM role');
    console.log("Viewing All Roles:");
    console.table(result.rows);
    await employeeTracker();
  } catch (error) {
    console.error('Error viewing roles', error);
  }
}

// View all employees
async function viewAllEmployees() {
  try {
    const result = await client.query('SELECT * FROM employee');
    console.log("Viewing All Employees:");
    console.table(result.rows);
    await employeeTracker();
  } catch (error) {
    console.error('Error viewing employees', error);
  }
}

// Add a new department
async function addDepartment() {
  try {
    const { department } = await inquirer.prompt([
      {
        type: 'input',
        name: 'department',
        message: 'What is the name of the department?',
        validate: input => input ? true : 'Please add a department!'
      }
    ]);
    await client.query('INSERT INTO department (name) VALUES ($1)', [department]);
    console.log(`Added ${department} to the database.`);
    await employeeTracker();
  } catch (error) {
    console.error('Error adding department', error);
  }
}

// Add a new role
async function addRole() {
  try {
    const result = await client.query('SELECT * FROM department');
    const departments = result.rows;

    const { role, salary, department } = await inquirer.prompt([
      {
        type: 'input',
        name: 'role',
        message: 'What is the name of the role?',
        validate: input => input ? true : 'Please add a role!'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?',
        validate: input => !isNaN(input) ? true : 'Please add a valid salary!'
      },
      {
        type: 'list',
        name: 'department',
        message: 'Which department does the role belong to?',
        choices: departments.map(dept => ({
          name: dept.name,
          value: dept.id
        }))
      }
    ]);

    await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [role, salary, department]);
    console.log(`Added ${role} to the database.`);
    await employeeTracker();
  } catch (error) {
    console.error('Error adding role', error);
  }
}

// Add a new employee
async function addEmployee() {
  try {
    const roleResult = await client.query('SELECT * FROM role');
    const roles = roleResult.rows;

    const empResult = await client.query('SELECT * FROM employee');
    const employees = empResult.rows;

    const { firstName, lastName, role, manager } = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: input => input ? true : 'Please add a first name!'
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: input => input ? true : 'Please add a last name!'
      },
      {
        type: 'list',
        name: 'role',
        message: "What is the employee's role?",
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      },
      {
        type: 'list',
        name: 'manager',
        message: "Who is the employee's manager?",
        choices: [
          { name: 'None', value: null },
          ...employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          }))
        ]
      }
    ]);

    await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, role, manager]);
    console.log(`Added ${firstName} ${lastName} to the database.`);
    await employeeTracker();
  } catch (error) {
    console.error('Error adding employee', error);
  }
}

// Update an employee's role
async function updateEmployeeRole() {
  try {
    const empResult = await client.query('SELECT * FROM employee');
    const employees = empResult.rows;

    const roleResult = await client.query('SELECT * FROM role');
    const roles = roleResult.rows;

    const { employee, role } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Which employee's role do you want to update?",
        choices: employees.map(emp => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id
        }))
      },
      {
        type: 'list',
        name: 'role',
        message: 'What is their new role?',
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]);

    await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role, employee]);
    console.log(`Updated employee's role.`);
    await employeeTracker();
  } catch (error) {
    console.error('Error updating employee role', error);
  }
}
