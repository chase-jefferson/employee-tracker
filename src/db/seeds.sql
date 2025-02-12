INSERT INTO department (id, department_name)
VALUES ('1', 'Engineering'),
('2', 'Sales'),
('3', 'Finance'),
('4', 'Legal');


INSERT INTO role (id, secion, title, salary, department_id)
VALUES ('1', '1', 'Lead Engineer', '100000', '1'),
('2', '1', 'Software Engineer', '80000', '1'),
('3', '2', 'Sales Lead', '80000', '2'),
('4', '2', 'Salesperson', '60000', '2'),
('5', '3', 'Accountant', '70000', '3'),
('6', '3', 'Finance Lead', '85000', '3'),
('7', '4', 'Lawyer', '120000', '4'),
('8', '4', 'Legal Team Lead', '125000', '4');


INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (' 1', 'John', 'Doe', '1', '2'),
('2', 'Jane', 'Doe', '2', '1'),
('3', 'Alice', 'Smith', '3', '4'),
('4', 'Bob', 'Smith', '4', '3'),
('5', 'Charlie', 'Brown', '5', '6'),
('6', 'David', 'Brown', '6', '5'),
('7', 'Eve', 'Black', '7', '8'),
('8', 'Frank', 'Black', '8', '7');