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
  
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dhruvjainn11/DineFlow.git

2. Navigate to the project directory:
   
   cd DineFlow

4. Install server dependencies:
   
   cd server

   npm install

5. Set up environment variables:

Create a .env file in the server directory.

Add the following variables:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

6. Start the server:

   npm run dev


5. 📡 Socket.IO Events
   | Event               | From     | To       | Purpose                    |
| ------------------- | -------- | -------- | -------------------------- |
| `orderPlaced`       | Customer | Kitchen  | Notify new order           |
| `orderStatusUpdate` | Kitchen  | Customer | Update status of an order  |
| `paymentRequested`  | Customer | Admin    | Notify admin for billing   |
| `paymentCompleted`  | Admin    | Customer | Payment marked as complete |


6. 🚧 Future Improvements
Role-based Access (e.g. staff)

Sales & Order Report Downloads

PWA Support

Feedback & Ratings System

Multi-language Support



## Postman Collection

A comprehensive Postman collection is available to test all API endpoints. You can import the collection using the following link:

[Download Postman Collection](./Postman/DineFlow_POSTMAN-COLLECTION.json)

Ensure to set the appropriate environment variables and headers as required.


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.


