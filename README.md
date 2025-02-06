# Full Stack Open Project

This project is a simple library application with user management and content management. There are three user roles Customer, Librarian and Admin.
Customers can borrow and return books. Librarians and Admins can also add library items and edit users. Librarians can only edit Customers. Admins can edit anybody.

The project is available on Render: [https://fullstackopen-project-1.onrender.com/](https://fullstackopen-project-1.onrender.com/).

## Technical Implementation

- **Frontend:** Angular 19
- **Backend:** Node.js 23 with Express 4.21
- **Database:** PostgreSQL 16

## Project Hours

For a detailed breakdown of work hours, see [Project Hours](./hours.md).

## Basic Usage

You can try the application by logging in with the following account:

- **Username:** `testuser`
- **Password:** `testuser`

The user `testuser` has **admin rights** and can access all functionalities.

After logging in, a menu will appear at the top with the following sections:

- **Library List** – Browse available library items and borrow them.
- **My Borrowed Items** – View and return borrowed items.
- **My Account** – Edit your personal details.
- **User Management** – Available only for **Admins** and **Librarians**, allowing user management.

### **Library List**
Displays available library items that users can borrow. A "Borrow" button is shown next to each item.
- The button is **disabled** if you have already borrowed the item or if all copies are borrowed.
- **Admins & Librarians** see an additional *"Create New Library Item"* button.

### **Create New Library Item**
Admins & Librarians can add a **single item** or **a batch of items**.
- Choose the preferred method from the dropdown menu.

### **My Borrowed Items**
Lists all items you have borrowed. Each item has a **Return** button, allowing you to return it.

### **My Account**
Users can edit their **username, first name, last name, and password**.

### **User Management** (Admin/Librarian only)
- **Librarians** can only edit **Customers**.
- **Admins** can edit **all users**.
- The *Create User* option allows adding new users.

### **Create User**
Admins can create users with **any role**.
Librarians can create **Customers** and other **Librarians**.

---

## Running the Backend Locally

### **Setup**
Create a `.env` file in the **project root** and add:

```ini
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
PORT=your_port_number
```

### Install dependencies
```sh
npm install
```

### Run in development mode
```sh
npm run dev
```

### Run in production mode
```sh
npm start
```

## Running the application frontend on localhost

### Build project
```sh
ng build
```

### Start project in development mode
```sh
ng serve
```

### Start project in development mode (alternative)
```sh
ng serve --configuration development
```

### Start project in production mode
```sh
ng serve --configuration production
```

### Run tests
```sh
ng test
```