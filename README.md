# DineFlow

DineFlow is a modern MERN-stack application designed to streamline the dine-in ordering experience. It offers a seamless interface for customers, kitchen staff, and administrators, ensuring efficient order management and real-time updates.

## Features

- **Customer Interface**: Scan QR codes to browse menus, place orders, and track order status in real-time.
- **Kitchen Dashboard**: View incoming orders, update order statuses, and manage preparation queues.
- **Admin Panel**: Manage menu items, tables, monitor payments, and access sales analytics.
- **Real-time Updates**: Leveraging Socket.IO for instant communication across the platform.

## Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code Generation**: qrcode library
- 
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dhruvjainn11/DineFlow.git

2. Navigate to the project directory:
   cd DineFlow

3. Install server dependencies:
cd server
npm install

4. Set up environment variables:

Create a .env file in the server directory.

Add the following variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

5. Start the server:
   npm run dev




### 5. API Documentation


```markdown
## API Endpoints

### Authentication
- **POST** `/api/users/login`: Authenticate user and retrieve token.

### Categories
- **POST** `/api/categories`: Create a new category.
- **GET** `/api/categories`: Retrieve all categories.
- **PUT** `/api/categories/:id`: Update a specific category.
- **DELETE** `/api/categories/:id`: Delete a specific category.

### Menu Items
- **POST** `/api/menu`: Add a new menu item.
- **GET** `/api/menu`: Retrieve all menu items.
- **PUT** `/api/menu/:id`: Update a specific menu item.
- **DELETE** `/api/menu/:id`: Delete a specific menu item.

### Tables
- **POST** `/api/tables`: Create a new table.
- **GET** `/api/tables`: Retrieve all tables.
- **PUT** `/api/tables/:id`: Update a specific table.
- **DELETE** `/api/tables/:id`: Delete a specific table.

### Orders
- **POST** `/api/orders`: Place a new order.
- **GET** `/api/orders`: Retrieve all orders.
- **PUT** `/api/orders/:id`: Update order status.
- **DELETE** `/api/orders/:id`: Delete an order.
```
## Postman Collection

A comprehensive Postman collection is available to test all API endpoints. You can import the collection using the following link:

[Download Postman Collection](link_to_your_postman_collection)

Ensure to set the appropriate environment variables and headers as required.


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.


