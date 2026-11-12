# 🚆 JATRA – Railway Management System

**A Database-Driven Railway Management System**

JATRA is a Railway Management System developed to manage railway operations through a centralized database. The system is designed to organize railway information, manage train and station details, handle passenger bookings, and support administrative operations.

This project was developed as an academic **Database Management Systems (DBMS) course project at the Military Institute of Science and Technology (MIST), Department of Computer Science and Engineering (CSE).**

---
<img width="1892" height="862" alt="image" src="https://github.com/user-attachments/assets/2a30227e-7295-4c37-8210-344ed2fd6c1d" />

## 📌 Project Overview

Managing railway operations involves handling large amounts of interconnected information, including trains, routes, stations, coaches, seats, passengers, bookings, and payments.

JATRA aims to simplify these operations by providing a structured database-driven system with role-based access and integrated frontend and backend functionality.

The project focuses on applying database concepts to a practical, real-world railway management scenario.

## ✨ Key Features

- **Passenger Management:** Manage passenger information and related records.
- **Train Management:** Organize train information and operational details.
- **Station Management:** Manage railway stations and their information.
- **Route Management:** Maintain train routes and station sequences.
- **Coach and Seat Management:** Organize coaches, seat categories, and seat availability.
- **Ticket Booking:** Handle passenger reservations and booking records.
- **Fare Calculation:** Calculate ticket fares based on journey distance, coach type, and passenger category.
- **Booking Cancellation:** Manage cancellations and related status updates.
- **Payment Management:** Maintain payment information and transaction records.
- **Complaint Management:** Handle passenger complaints.
- **Lost and Found Management:** Manage reported lost and found items.
- **Role-Based Access Control:** Provide different access levels for passengers and railway management personnel.

## 👥 User Roles

The system supports the following roles:

| Role | Responsibility |
|---|---|
| Passenger | Access passenger-related services and bookings |
| Admin | Manage system-wide information and operations |
| Train Manager | Manage train-related operations |
| Station Master | Manage station-related operations |
| Ticket Manager | Handle ticket-related operations |

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask |
| Database | Oracle Database |
| Database Connectivity | Python Oracle Database Driver |
| Development Environment | Visual Studio Code |
| Database Management | Oracle SQL Developer |

## 🗄️ Database Design

The database is the core component of JATRA. It is designed to maintain relationships between railway entities and ensure consistent data management.

The project applies several important DBMS concepts:

- Relational database design
- Primary keys and foreign keys
- One-to-One, One-to-Many, and Many-to-Many relationships
- Database normalization
- SQL queries and joins
- Views and subqueries
- Stored procedures and functions
- Database triggers
- Constraints and data integrity
- Transaction management

The system also uses a junction table to represent the many-to-many relationship between routes and stations.

## 💰 Fare Calculation

JATRA implements a dynamic fare calculation approach based on journey distance and other relevant factors.

The calculation considers:

- Distance between stations
- Rate per kilometer
- Coach type
- Passenger category
- VAT and service charges

This allows the system to calculate fares according to journey and passenger details rather than relying entirely on manually entered ticket prices.

## 📂 Project Structure

```text
JATRA-Railway-Management-System/
│
├── backend/
│   ├── app.py
│   ├── auth_utils.py
│   ├── db.py
│   └── requirements.txt
│
├── frontend/
│   └── railway-management-system/
│
├── database/
│   └── jatra_railway_database_final.sql
│
├── .gitignore
└── README.md
```

*The structure above highlights the main project components.*

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sham-me09/JATRA-Railway-Management-System.git
```

### 2. Navigate to the Project Directory

```bash
cd JATRA-Railway-Management-System
```

### 3. Set Up the Database

- Install and configure Oracle Database.
- Open Oracle SQL Developer.
- Connect to your Oracle database.
- Execute the SQL script located in:

```text
database/jatra_railway_database_final.sql
```

### 4. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Configure your database connection using environment variables in a local `.env` file. Use your own Oracle database credentials and connection details.

### 5. Run the Backend

```bash
python app.py
```

The Flask backend is configured to run locally on:

```text
http://127.0.0.1:5000
```

### 6. Run the Frontend

Open the frontend project in Visual Studio Code and run it using your preferred local development server.

Ensure the backend and database are running and properly connected.

---

## 🎓 Academic Context

**Project:** JATRA – Railway Management System

**Course:** Database Management Systems (DBMS)

**Institution:** Military Institute of Science and Technology (MIST)

**Department:** Computer Science and Engineering (CSE)

**Project Objective:**

To design and implement a practical database-driven application that demonstrates the application of relational database concepts, SQL, database design, integrity constraints, relationships, and backend-database integration in a real-world railway management scenario.

## 👩‍💻 Author

**Shamme**

Computer Science and Engineering  
Military Institute of Science and Technology (MIST)

GitHub: [@Sham-me09](https://github.com/Sham-me09)

---

## 📜 License

This project was developed for academic purposes as part of the Database Management Systems course at MIST.
