# Data Encryption for IT Company

## Overview

This project focuses on implementing a data encryption solution for an IT company to securely manage employee details. The application provides functionalities for registering employees and allows users to view, update, or delete employee information while ensuring sensitive data is encrypted.

In today's digital age, protecting sensitive information is paramount. Encryption safeguards employee data such as social security numbers, bank account details, and personal identifiers from unauthorized access. By ensuring that this information is not displayed in plaintext, the project enhances privacy and compliance with data protection regulations.

## Technologies Used

- **Frontend:**
  - HTML
  - Tailwind CSS
  - JavaScript
- **Backend:**
  - Node.js
  - Express.js
  - MySQL

## Project Structure

```
/data-encryption-project
│
├── public                  # Contains all HTML files
│   ├── login.html          # Login page
│   ├── dashboard.html      # Dashboard for viewing employee data
│   ├── add.html            # Form for adding new employees
│   ├── edit.html           # Form for editing employee information
│   └── view.html           # View employee information
│
├── app.js                # Handles database logic
├── server.js             # Manages the backend and server setup
├── package.json          # Project dependencies and scripts
└── .env                  # Environment variables
```

## Features

- **User Authentication:**
  - Login functionality to access the dashboard.
- **Employee Management:**
  - Add, view, update, and delete employee records.
- **Data Encryption:**
  - Sensitive data fields are encrypted for privacy and security, ensuring that even if the database is compromised, the information remains protected. Unauthorized users will not be able to decipher the encrypted content, preserving confidentiality.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd data-encryption-project
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root directory with the following structure:

   ```
   DB_HOST=Your_Database_Host
   DB_USER=Your_Database_User
   DB_PASSWORD=Your_Database_Password
   DB_NAME=Your_Database_Name
   SECRET_KEY=Your_Secret_Key
   ```

4. Set up your MySQL database:
   ## Database Table Structures

### Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

### Employees Table

```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    social_security_number VARCHAR(255) NOT NULL  UNIQUE,
    bank_account VARCHAR(255) NOT NULL UNIQUE
);
```

5. Run the server:

   ```bash
   node server.js
   ```

6. Open your browser and go to `http://localhost:3000` to access the application.

## Usage

- Use the login page to enter your credentials.
- Upon successful login, navigate to the dashboard to manage employee records.
- Use the provided forms to add or update employee information, ensuring that sensitive data is encrypted.

## Importance of Data Encryption

Data encryption is essential for protecting sensitive employee information from unauthorized access and breaches. By encrypting sensitive fields, such as:

- Social Security Numbers
- Bank Account Details
- Personal Identifiers

The project ensures that this data is unreadable to anyone who does not have the appropriate decryption keys, maintaining the privacy of employees and complying with data protection regulations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
