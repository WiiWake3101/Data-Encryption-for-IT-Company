require('dotenv').config();
const mysql = require('mysql2');
const crypto = require('crypto');

// Load environment variables from .env file
const secretKey = process.env.SECRET_KEY;

// Set up the MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Function to encrypt sensitive data
function encrypt(text, secretKey) {
    const cipher = crypto.createCipher('aes-256-ctr', secretKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Employee details by department
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
        "Customer Service Manager", "Support Agent", "Customer Experience Specialist", "Technical Support Specialist", "Customer Support Specialist",
        "Customer Care Associate", "Help Desk Technician", "Customer Success Manager", "Call Center Representative", "Customer Support Lead"
    ],
    "Administration Department": [
        "Office Manager", "Administrative Assistant", "Executive Assistant", "Receptionist", "Facilities Coordinator",
        "Office Administrator", "Clerical Assistant", "Records Manager", "Administrative Officer", "Personal Assistant"
    ]
};

// Function to generate employee data with valid dob
function generateEmployeeData(firstName, lastName, department, position, index) {
    const salary = Math.floor(10000 + Math.random() * 5000); // Random salary between 10000 and 15000
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}@company.com`;
    const phone = `12345${Math.floor(10000 + Math.random() * 90000)}`;
    const gender = index % 2 === 0 ? 'Male' : 'Female';
    
    // Correct date generation: Random year between 1980-2000, random month between 1-12, random day between 1-28
    const year = Math.floor(1980 + Math.random() * 21); // Random year between 1980 and 2000
    const month = ('0' + (Math.floor(1 + Math.random() * 12))).slice(-2); // Random month between 1 and 12
    const day = ('0' + (Math.floor(1 + Math.random() * 28))).slice(-2); // Random day between 1 and 28
    
    const dob = `${year}-${month}-${day}`;  // Valid date format: YYYY-MM-DD
    
    const ssn = `SSN00${index}12345`;  // Sample SSN
    const bankAccount = `BANK00${index}12345`;  // Sample Bank Account

    return {
        firstName,
        lastName,
        department,
        position,
        salary,
        email,
        phone,
        gender,
        dob,
        ssn,
        bankAccount
    };
}


// Insert employees for each department
Object.keys(departments).forEach(department => {
    const positions = departments[department];

    for (let i = 0; i < 20; i++) {
        const firstName = `Employee${i + 1}`;
        const lastName = `Last${i + 1}`;
        const position = positions[i % positions.length];

        const employee = generateEmployeeData(firstName, lastName, department, position, i + 1);

        // Encrypt sensitive data
        const encryptedSSN = encrypt(employee.ssn, secretKey);
        const encryptedBankAccount = encrypt(employee.bankAccount, secretKey);

        // Insert into the database
        const query = `INSERT INTO employees 
            (first_name, last_name, department, position, salary, email, phone, gender, dob, social_security_number, bank_account)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.execute(query, [employee.firstName, employee.lastName, employee.department, employee.position, employee.salary, employee.email, employee.phone, employee.gender, employee.dob, encryptedSSN, encryptedBankAccount], 
            (err, results) => {
                if (err) throw err;
                console.log('Employee inserted:', results.insertId);
            }
        );
    }
});

// Close the connection after all insertions
connection.end();