import inquirer from 'inquirer';
import logo from 'asciiart-logo'; 
import Db from './db/index.js';

const db = new Db();

init();

// Display Logo text, Load main prompts
function init() {
    const logoText = logo({ name: 'Employee Manager' }).render();
    console.log(logoText);
    loadMainPrompts();
}

function loadMainPrompts() {
    inquirer.prompt([
        {
            type: 'list', 
            name: 'choice',
            message: 'What would you like to do?', 
            choices: [
                { name: 'View All Employees', value: 'VIEW_EMPLOYEES' },
                { name: 'View All Employees By Department', value: 'VIEW_EMPLOYEES_BY_DEPARTMENT' },
                { name: 'View All Employees By Manager', value: 'VIEW_EMPLOYEES_BY_MANAGER' },
                { name: 'Add Employee', value: 'ADD_EMPLOYEE' },
                { name: 'Remove Employee', value: 'REMOVE_EMPLOYEE' },
                { name: 'Update Employee Role', value: 'UPDATE_EMPLOYEE_ROLE' },
                { name: 'Update Employee Manager', value: 'UPDATE_EMPLOYEE_MANAGER' },
                { name: 'View All Roles', value: 'VIEW_ROLES' },
                { name: 'Add Role', value: 'ADD_ROLE' },
                { name: 'Remove Role', value: 'REMOVE_ROLE' },
                { name: 'View All Departments', value: 'VIEW_DEPARTMENTS' },
                { name: 'Add Department', value: 'ADD_DEPARTMENT' },
                { name: 'Remove Department', value: 'REMOVE_DEPARTMENT' },
                { name: 'View Utilized Budget By Department', value: 'VIEW_UTILIZED_BUDGET_BY_DEPARTMENT' },
                { name: 'Quit', value: 'QUIT' },
            ],
        },
    ]).then(({ choice }) => {
        switch (choice) {
            case 'VIEW_EMPLOYEES': viewEmployees(); break;
            case 'VIEW_EMPLOYEES_BY_DEPARTMENT': viewEmployeesByDepartment(); break;
            case 'VIEW_EMPLOYEES_BY_MANAGER': viewEmployeesByManager(); break;
            case 'ADD_EMPLOYEE': addEmployee(); break;
            case 'REMOVE_EMPLOYEE': removeEmployee(); break;
            case 'UPDATE_EMPLOYEE_ROLE': updateEmployeeRole(); break;
            case 'UPDATE_EMPLOYEE_MANAGER': updateEmployeeManager(); break;
            case 'VIEW_ROLES': viewRoles(); break;
            case 'ADD_ROLE': addRole(); break;
            case 'REMOVE_ROLE': removeRole(); break;
            case 'VIEW_DEPARTMENTS': viewDepartments(); break;
            case 'ADD_DEPARTMENT': addDepartment(); break;
            case 'REMOVE_DEPARTMENT': removeDepartment(); break;
            case 'VIEW_UTILIZED_BUDGET_BY_DEPARTMENT': viewUtilizedBudgetByDepartment(); break;
            case 'QUIT': quit(); break;
        }
    });
}

// View all employees
function viewEmployees() {
    db.findAllEmployees()
        .then(({ rows }) => {
            console.log('\n');
            console.table(rows);
        })
        .then(() => loadMainPrompts());
}

// Quit the application
function quit() {
    console.log('Goodbye!');
    process.exit();
}

// View all roles
function viewRoles() {
    db.findAllRoles()
        .then(({ rows }) => {
            console.log('\n');
            console.table(rows);
        })
        .then(() => loadMainPrompts());
}

// Add a role
async function addRole() {
    const { rows: departments } = await db.findAllDepartments();

    // Fix the mapping by using 'department_name' instead of 'name'
    const departmentChoices = departments.map(({ id, department_name }) => ({
        name: department_name,  // Displayed to the user
        value: id               // The actual value used in the database
    }));

    // Check if departments are available
    if (departmentChoices.length === 0) {
        console.log('No departments found. Please add a department first.');
        return loadMainPrompts();
    }

    // Display choices to the user
    inquirer.prompt([
        { type: 'input', name: 'title', message: "What is the name of the role?" },
        { type: 'input', name: 'salary', message: "What is the salary of the role?" },
        { type: 'list', name: 'departmentId', message: "Which department does the role belong to?", choices: departmentChoices }
    ]).then(({ title, salary, departmentId }) => {
        db.createRole({ title, salary, departmentId })
            .then(() => console.log(`Added ${title} to the database`))
            .then(() => loadMainPrompts());
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'departmentName',
            message: 'What is the name of the new department?'
        }
    ]).then(({ departmentName }) => {
        db.createDepartment(departmentName)
            .then(() => console.log(`Added ${departmentName} to the database.`))
            .then(() => loadMainPrompts())
            .catch((err: unknown) => {
                console.error("Error adding department:", err);
                loadMainPrompts();
            });
    });
}



function viewDepartments() {
    db.findAllDepartments()
        .then(({ rows }) => {
            console.log('\n');
            console.table(rows);
        })
        .then(() => loadMainPrompts())
        .catch(err => {
            console.error("Error fetching departments:", err);
            loadMainPrompts();
        });
}



// View utilized budget by department
function viewUtilizedBudgetByDepartment() {
    db.findUtilizedBudgetByDepartment()
        .then(({ rows }) => {
            console.log('\n');
            console.table(rows);
        })
        .then(() => loadMainPrompts());
}

// Remove a role
async function removeRole() {
    const { rows: roles } = await db.findAllRoles();
    const roleChoices = roles.map(({ id, title }) => ({ name: title, value: id }));

    inquirer.prompt([
        { type: 'list', name: 'roleId', message: "Which role do you want to remove?", choices: roleChoices }
    ]).then(({ roleId }) => {
        db.removeRole(roleId)
            .then(() => console.log(`Removed role from the database`))
            .then(() => loadMainPrompts());
    });
}

// Remove an employee
async function removeEmployee() {
    const { rows: employees } = await db.findAllEmployees();
    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }));

    inquirer.prompt([
        { type: 'list', name: 'employeeId', message: "Which employee do you want to remove?", choices: employeeChoices }
    ]).then(({ employeeId }) => {
        db.removeEmployee(employeeId)
            .then(() => console.log(`Removed employee from the database`))
            .then(() => loadMainPrompts());
    });
}

// Add an employee
async function addEmployee() {
    const { rows: roles } = await db.findAllRoles();
    const { rows: employees } = await db.findAllEmployees();

    const roleChoices = roles.map(({ id, title }) => ({ name: title, value: id }));
    const managerChoices = [
        { name: 'None', value: null },
        ...employees.map(({ id, first_name, last_name }) => ({ name: `${first_name} ${last_name}`, value: id }))
    ];
    
    inquirer.prompt([
        { type: 'input', name: 'firstName', message: "What is the employee's first name?" },
        { type: 'input', name: 'lastName', message: "What is the employee's last name?" },
        { type: 'list', name: 'roleId', message: "What is the employee's role?", choices: roleChoices },
        { type: 'list', name: 'managerId', message: "Who is the employee's manager?", choices: managerChoices },
    ]).then(({ firstName, lastName, roleId, managerId }) => {
        db.createEmployee({ firstName, lastName, roleId, managerId })
            .then(() => console.log(`Added ${firstName} ${lastName} to the database`))
            .then(() => loadMainPrompts());
    });
}

// View all employees by manager
async function viewEmployeesByManager() {
    const { rows: managers } = await db.findAllManagers();
    const managerChoices = managers.map(({ id, name }) => ({ name, value: id }));

    inquirer.prompt([
        { type: 'list', name: 'managerId', message: 'Which manager would you like to see employees for?', choices: managerChoices }
    ]).then(({ managerId }) => {
        db.findAllEmployeesByManager(managerId)
            .then(({ rows }) => {
                console.log('\n');
                console.table(rows);
            })
            .then(() => loadMainPrompts());
    });
}

// View all employees by department
async function viewEmployeesByDepartment() {
    const { rows: departments } = await db.findAllDepartments();
    const departmentChoices = departments.map(({ id, name }) => ({ name, value: id }));

    inquirer.prompt([
        { type: 'list', name: 'departmentId', message: 'Which department would you like to see employees for?', choices: departmentChoices }
    ]).then(({ departmentId }) => {
        db.findAllEmployeesByDepartment(departmentId)
            .then(({ rows }) => {
                console.log('\n');
                console.table(rows);
            })
            .then(() => loadMainPrompts());
    });
}

async function updateEmployeeRole() {
    const { rows: employees } = await db.findAllEmployees();
    const { rows: roles } = await db.findAllRoles();

    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));

    inquirer.prompt([
        { 
            type: 'list',
            name: 'employeeId',
            message: "Which employee's role do you want to update?",
            choices: employeeChoices 
        },
        { 
            type: 'list',
            name: 'roleId',
            message: "What is the employee's new role?",
            choices: roleChoices 
        }
    ]).then(({ employeeId, roleId }) => {
        db.updateEmployeeRole(employeeId, roleId)
            .then(() => console.log(`Updated employee's role successfully.`))
            .then(() => loadMainPrompts());
    });
}

async function updateEmployeeManager() {
    const { rows: employees } = await db.findAllEmployees();

    const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }));

    inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: "Which employee's manager do you want to update?",
            choices: employeeChoices
        }
    ]).then(({ employeeId }) => {
        const managerChoices = employees
            .filter(({ id }) => id !== employeeId)  // Prevent employee from being their own manager
            .map(({ id, first_name, last_name }) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'managerId',
                message: "Who is the employee's new manager?",
                choices: managerChoices
            }
        ]).then(({ managerId }) => {
            db.updateEmployeeManager(employeeId, managerId)
                .then(() => console.log(`Updated employee's manager successfully.`))
                .then(() => loadMainPrompts());
        });
    });
}
async function removeDepartment() {
    const { rows: departments } = await db.findAllDepartments();

    const departmentChoices = departments.map(({ id, department_name }) => ({
        name: department_name,
        value: id
    }));

    inquirer.prompt([
        {
            type: 'list',
            name: 'departmentId',
            message: 'Which department do you want to remove?',
            choices: departmentChoices
        }
    ]).then(({ departmentId }) => {
        db.removeDepartment(departmentId)
            .then(() => console.log(`Removed department successfully.`))
            .then(() => loadMainPrompts());
    });
}


// Placeholder functions for missing cases
// Placeholder function for missing cases
// Placeholder function for missing cases
// function addDepartment() { console.log('Add Department not implemented yet'); loadMainPrompts(); }

