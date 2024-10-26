require('dotenv').config();
const mysql = require('mysql2');
const CryptoJS = require('crypto-js');
const { faker } = require('@faker-js/faker');

// Database connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Import secret key from .env
const secretKey = process.env.SECRET_KEY;

// Function to encrypt data using CryptoJS
function encryptData(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

// Department and job titles data
const departments = {
  "IT Department": [
    "Software Engineer", "System Administrator", "Data Analyst", "Web Developer", "Network Engineer",
    "DevOps Engineer", "Database Administrator", "IT Support Specialist", "Security Analyst", "Cloud Engineer"
  ],
  "HR Department": [
    "HR Manager", "Recruitment Specialist", "HR Coordinator", "Employee Relations Manager", "Training Specialist",
    "Compensation Analyst", "HR Assistant", "Talent Development Manager", "Payroll Specialist", "HR Business Partner"
  ],
  "Sales Department": [
    "Sales Manager", "Sales Associate", "Business Development Executive", "Account Executive", "Sales Engineer",
    "Regional Sales Manager", "Inside Sales Representative", "Sales Support Specialist", "Key Account Manager", "Sales Analyst"
  ],
  "Marketing Department": [
    "Marketing Director", "Brand Manager", "Social Media Specialist", "Marketing Analyst", "Content Strategist",
    "SEO Specialist", "Product Marketing Manager", "Event Coordinator", "Digital Marketing Specialist", "Marketing Operations Manager"
  ],
  "Finance Department": [
    "Chief Financial Officer", "Financial Controller", "Treasury Analyst", "Budget Analyst", "Credit Analyst",
    "Investment Analyst", "Financial Analyst", "Risk Management Analyst", "Accounts Payable Specialist", "Payroll Manager"
  ],
  "Customer Support": [
    "Customer Service Manager", "Support Agent", "Customer Experience Specialist", "Technical Support Specialist",
    "Customer Support Specialist", "Customer Care Associate", "Help Desk Technician", "Customer Success Manager",
    "Call Center Representative", "Customer Support Lead"
  ],
  "Administration Department": [
    "Office Manager", "Administrative Assistant", "Executive Assistant", "Receptionist", "Facilities Coordinator",
    "Office Administrator", "Clerical Assistant", "Records Manager", "Administrative Officer", "Personal Assistant"
  ]
};

// Function to get a random department and job title
function getRandomDepartmentAndTitle() {
  const departmentNames = Object.keys(departments);
  const department = departmentNames[Math.floor(Math.random() * departmentNames.length)];
  const jobTitle = departments[department][Math.floor(Math.random() * departments[department].length)];
  return { department, jobTitle };
}

// Generate realistic user data and insert into the database
function insertUsers() {
  const users = [];
  for (let i = 1; i <= 100; i++) {
    const { department, jobTitle } = getRandomDepartmentAndTitle();

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const salary = Math.floor(30000 + Math.random() * 20000);
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    const dob = faker.date.past({ years: 30, refDate: '2000-01-01' }).toISOString().split('T')[0]; // Random date of birth before 2000

    // Sensitive data: encrypt social_security_number and bank_account
    const socialSecurityNumber = encryptData(`${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`); // Random SSN
    const bankAccount = encryptData(`${Math.floor(1000000000 + Math.random() * 9000000000)}`); // Random bank account number

    users.push([firstName, lastName, department, jobTitle, salary, email, phone, gender, dob, socialSecurityNumber, bankAccount]);
  }

  // SQL query to insert users in bulk
  const query = `
    INSERT INTO employees (first_name, last_name, department, position, salary, email, phone, gender, dob, social_security_number, bank_account)
    VALUES ?
  `;

  // Execute the insertion
  connection.query(query, [users], (err, results) => {
    if (err) {
      console.error('Error inserting users:', err);
      return;
    }
    console.log(`Inserted ${results.affectedRows} users`);
  });

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err);
      return;
    }
    console.log('Database connection closed');
  });
}

// Call the function to insert user data
insertUsers();