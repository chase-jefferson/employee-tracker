import { pool } from './connection.js';

export default class Db {
  constructor() {}

  // Generic query method with error handling
  async query(sql: string, args: any[] = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, args);
      return result;
    } catch (err) {
      console.error('Database query failed:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // Find all employees with roles, salaries, departments, and managers
  async findAllEmployees() {
    return this.query(
      `SELECT employee.id, employee.first_name, employee.last_name, role.title, 
              department.department_name AS department, role.salary, 
              CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
       FROM employee 
       LEFT JOIN role ON employee.role_id = role.id 
       LEFT JOIN department ON role.department_id = department.id 
       LEFT JOIN employee manager ON manager.id = employee.manager_id`
    );
  }

  // Find all roles
  async findAllRoles() {
    return this.query(
      'SELECT role.id, role.title, role.salary, department.department_name AS department FROM role LEFT JOIN department ON role.department_id = department.id'
    );
  }

  // Create a new department
  async createDepartment(departmentName: string) {
    return this.query(
      'INSERT INTO department (department_name) VALUES ($1)',
      [departmentName]
    );
  }

  // Find all departments
  async findAllDepartments() {
    return this.query('SELECT id, department_name FROM department');
  }

  // Find all managers (distinct list of employees who are managers)
  async findAllManagers() {
    return this.query(
      `SELECT DISTINCT manager.id, CONCAT(manager.first_name, ' ', manager.last_name) AS name 
       FROM employee 
       INNER JOIN employee manager ON manager.id = employee.manager_id`
    );
  }

  // Find all employees by department
  async findAllEmployeesByDepartment(departmentId: number) {
    return this.query(
      `SELECT employee.id, employee.first_name, employee.last_name, role.title 
       FROM employee 
       LEFT JOIN role ON employee.role_id = role.id 
       WHERE role.department_id = $1`,
      [departmentId]
    );
  }

  // Find all employees managed by a specific manager
  async findAllEmployeesByManager(managerId: number) {
    return this.query(
      `SELECT employee.id, employee.first_name, employee.last_name, role.title 
       FROM employee 
       LEFT JOIN role ON employee.role_id = role.id 
       WHERE employee.manager_id = $1`,
      [managerId]
    );
  }

  // Find all employees except the given employee id (for manager selection)
  async findAllPossibleManagers(employeeId: number) {
    return this.query(
      'SELECT id, first_name, last_name FROM employee WHERE id != $1',
      [employeeId]
    );
  }

  // Create a new employee
  async createEmployee(employee: { firstName: string; lastName: string; roleId: number; managerId: number }) {
    const { firstName, lastName, roleId, managerId } = employee;
    return this.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [firstName, lastName, roleId, managerId]
    );
  }

  // Remove an employee by ID
  async removeEmployee(employeeId: number) {
    return this.query('DELETE FROM employee WHERE id = $1', [employeeId]);
  }

  // Create a new role
  async createRole(role: { title: string; salary: number; departmentId: number }) {
    const { title, salary, departmentId } = role;
    return this.query(
      'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
      [title, salary, departmentId]
    );
  }

  // Remove a role by ID
  async removeRole(roleId: number) {
    return this.query('DELETE FROM role WHERE id = $1', [roleId]);
  }

  // View utilized budget by department
  async findUtilizedBudgetByDepartment() {
    return this.query(
      `SELECT department.department_name AS department, COALESCE(SUM(role.salary), 0) AS utilized_budget 
       FROM department 
       LEFT JOIN role ON department.id = role.department_id 
       LEFT JOIN employee ON role.id = employee.role_id 
       GROUP BY department.department_name`
    );
  }

  // Update employee role
  async updateEmployeeRole(employeeId: number, roleId: number) {
    return this.query(
      'UPDATE employee SET role_id = $1 WHERE id = $2',
      [roleId, employeeId]
    );
  }

  // Update employee manager
  async updateEmployeeManager(employeeId: number, managerId: number) {
    return this.query(
      'UPDATE employee SET manager_id = $1 WHERE id = $2',
      [managerId, employeeId]
    );
  }

  // Remove a department
  async removeDepartment(departmentId: number) {
    return this.query(
      'DELETE FROM department WHERE id = $1',
      [departmentId]
    );
  }
}


