require("dotenv").config();
const mysql = require("mysql2");

// Create a connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Function to check login
const checkLogin = (username, password, callback) => {
  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.execute(query, [username, password], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Function to get the total number of employees
function getTotalEmployees(callback) {
  const query = "SELECT COUNT(*) AS totalEmployees FROM employees";
  db.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results[0].totalEmployees);
  });
}

// Function to get counts by department
function getDepartmentCounts(callback) {
  const query =
    "SELECT department, COUNT(*) AS count FROM employees GROUP BY department";
  db.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    const counts = {};
    results.forEach((row) => {
      counts[row.department] = row.count;
    });
    callback(null, counts);
  });
}

// Function to add employee to the database
function addEmployee(employeeData, callback) {
  const query = `INSERT INTO employees (first_name, last_name, department, position, phone, email, dob, gender, salary, social_security_number, bank_account) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    employeeData.first_name,
    employeeData.last_name,
    employeeData.department,
    employeeData.position,
    employeeData.phone,
    employeeData.email,
    employeeData.dob,
    employeeData.gender,
    employeeData.salary,
    employeeData.social_security_number,
    employeeData.bank_account,
  ];

  db.query(query, params, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
}

// Function to get the information of an employee
function viewEmployee(id, callback) {
  const query = "SELECT * FROM employees WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      return callback(err);
    }
    // Check if an employee was found
    if (results.length > 0) {
      callback(null, results[0]); // Return the first (and should be only) employee record
    } else {
      callback(null, null); // No employee found
    }
  });
}

// Function to delete an employee by ID
function deleteEmployee(id, callback) {
  const query = "DELETE FROM employees WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result); // Pass the full result to the callback
  });
}

function updateEmployee(employeeId, updatedData, callback) {
  const query = "UPDATE employees SET ? WHERE id = ?"; // Assuming your table is named 'employees'
  const values = [updatedData, employeeId];

  db.query(query, values, (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
}

module.exports = {
  checkLogin,
  getTotalEmployees,
  getDepartmentCounts,
  addEmployee,
  viewEmployee,
  deleteEmployee,
  updateEmployee,
};