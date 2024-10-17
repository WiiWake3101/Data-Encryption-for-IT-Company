require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const {
  checkLogin,
  getTotalEmployees,
  getDepartmentCounts,
  addEmployee,
  viewEmployee,
  deleteEmployee,
  updateEmployee,
} = require("./app");
const path = require("path");
const app = express();
const CryptoJS = require("crypto-js");
const cors = require("cors");
const session = require("express-session"); // Import express-session

const secretKey = process.env.SECRET_KEY;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: secretKey, // Use the secret key from .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using https
  })
);

// Serve static files (your HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // User is authenticated, proceed to the next middleware/route
  } else {
    return res.redirect("/log-in"); // User is not authenticated, redirect to login
  }
};

// Define the route for log-in
app.get("/log-in", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Handle login POST request
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  checkLogin(username, password, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length > 0) {
      // Successful login
      req.session.user = username; // Store the username in the session
      return res.redirect("/dashboard"); // Redirect to dashboard
    } else {
      // Failed login
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// Define the route for dashboard with authentication
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Define the route for Adding user with authentication
app.get("/add", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "add.html"));
});

// Define the route for Viewing user with authentication
app.get("/view", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "view.html"));
});

// Define the route for Deleting user with authentication
app.get("/delete", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "delete.html"));
});

// Define the route for updating user information with authentication
app.get("/update", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "edit.html"));
});

// API endpoint to fetch dashboard data
app.get("/dashboard-data", isAuthenticated, (req, res) => {
  getTotalEmployees((err, totalEmployees) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    getDepartmentCounts((err, departmentCounts) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        totalEmployees,
        departmentCounts,
      });
    });
  });
});

// Endpoint to handle adding an employee
app.post("/add-employee", isAuthenticated, (req, res) => {
  const {
    first_name,
    last_name,
    department,
    position,
    phone,
    email,
    dob,
    gender,
    salary,
    social_security_number,
    bank_account,
  } = req.body;

  // Encrypt sensitive data
  const encryptedSocialSecurity = CryptoJS.AES.encrypt(
    social_security_number,
    secretKey
  ).toString();
  const encryptedBankAccount = CryptoJS.AES.encrypt(
    bank_account,
    secretKey
  ).toString();

  // Create an object to hold the employee data, including encrypted fields
  const employeeData = {
    first_name,
    last_name,
    department,
    position,
    phone,
    email,
    dob,
    gender,
    salary,
    social_security_number: encryptedSocialSecurity, // Use encrypted value
    bank_account: encryptedBankAccount, // Use encrypted value
  };

  console.log("Employee Data to Add:", employeeData); // Log the employee data being sent to the database

  // Call the addEmployee function to insert data into the database
  addEmployee(employeeData, (err, result) => {
    if (err) {
      console.error("Error adding employee:", err);
      return res.status(500).json({ error: "Failed to add employee" });
    }
    res.status(201).json({ message: "Employee added successfully", result });
  });
});

// Route to get employee information by ID with authentication
app.get("/employee/:id", isAuthenticated, (req, res) => {
  const employeeId = req.params.id;

  viewEmployee(employeeId, (err, employee) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching employee data" });
    }
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Log the fetched employee data
    console.log("Fetched Employee Data:", employee);

    // Decrypt sensitive fields (only social_security_number and bank_account)
    try {
      const decryptedEmployee = {
        id: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        department: employee.department,
        position: employee.position,
        email: employee.email,
        phone: employee.phone,
        gender: employee.gender,
        dob: employee.dob,
        salary: employee.salary,
        socialSecurityNumber: CryptoJS.AES.decrypt(
          employee.social_security_number,
          process.env.SECRET_KEY
        ).toString(CryptoJS.enc.Utf8),
        bankAccount: CryptoJS.AES.decrypt(
          employee.bank_account,
          process.env.SECRET_KEY
        ).toString(CryptoJS.enc.Utf8),
      };
      res.json(decryptedEmployee); // Send the decrypted employee data
    } catch (decryptError) {
      console.error("Decryption error:", decryptError);
      return res.status(500).json({ error: "Failed to decrypt data" });
    }
  });
});

// DELETE route to delete an employee by ID with authentication
app.delete("/employee/:id", isAuthenticated, (req, res) => {
  const employeeId = req.params.id;

  // Use the deleteEmployee function
  deleteEmployee(employeeId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting employee" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  });
});

// Endpoint to handle updating an employee with authentication
app.put("/edit/:id", isAuthenticated, (req, res) => {
  const employeeId = req.params.id; // Get employee ID from the URL parameter
  const {
    first_name,
    last_name,
    department,
    position,
    phone,
    email,
    dob,
    gender,
    salary,
    social_security_number,
    bank_account,
  } = req.body;

  // Check if employeeId is valid
  if (!employeeId || !first_name || !last_name) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Encrypt sensitive data
  const encryptedSocialSecurity = CryptoJS.AES.encrypt(
    social_security_number,
    secretKey
  ).toString();
  const encryptedBankAccount = CryptoJS.AES.encrypt(
    bank_account,
    secretKey
  ).toString();

  // Create an object to hold the updated employee data, including encrypted fields
  const updatedEmployeeData = {
    first_name,
    last_name,
    department,
    position,
    phone,
    email,
    dob,
    gender,
    salary,
    social_security_number: encryptedSocialSecurity,
    bank_account: encryptedBankAccount,
  };

  console.log("Employee Data to Update:", updatedEmployeeData); // Log the updated employee data

  // Call the updateEmployee function to update data in the database
  updateEmployee(employeeId, updatedEmployeeData, (err, result) => {
    if (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({ error: "Failed to update employee" });
    }
    res.status(200).json({ message: "Employee updated successfully", result });
  });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.redirect("/log-in"); // Redirect to login page after logout
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the login page at: http://localhost:${PORT}/log-in`);
});
