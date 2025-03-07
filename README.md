# B2B Application

This repository contains the backend and frontend for the B2B application. The frontend is built using Vite.js, and the backend is developed using Express.js without any boilerplate code.

## Folder Structure
- `backend/` - Contains the backend code (Node.js + Express + MongoDB)
- `hotel-app/` - Contains the frontend code (Vite.js + React)

---

## Setup Instructions

### Backend Setup

1. Navigate to the `backend` folder:
   ```sh
   cd backend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the `backend` directory and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   ```

4. Start the backend server:
   ```sh
   npm start
   ```

The backend server will be running on `http://localhost:5000` by default.

### Frontend Setup

1. Navigate to the `hotel-app` folder:
   ```sh
   cd hotel-app
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the frontend development server:
   ```sh
   npm run dev
   ```

The frontend will be running on `http://localhost:5173` by default.

---

## API Routes

| Method | Endpoint                | Description                            | Token Required |
|--------|-------------------------|----------------------------------------|----------------|
| POST   | `/api/auth/register`    | Register a new user                   | No             |
| POST   | `/api/auth/login`       | Login user                            | No             |
| GET    | `/api/menu/today`       | Get today's menu                      | No             |
| GET    | `/api/menu/all-menus`   | Get all menus                         | No             |
| GET    | `/api/menu/:date`       | Get menu by date                      | No             |
| POST   | `/api/menu/`            | Create a new menu                     | Yes            |
| PUT    | `/api/menu/:date`       | Update menu by date                   | Yes            |
| DELETE | `/api/menu/:date`       | Delete menu by date                   | Yes            |
| POST   | `/api/orders/place-order` | Place an order                        | Yes            |
| POST   | `/api/orders/place-order/guest-login` | Place an order as a guest | No             |
| GET    | `/api/orders/order-history` | Get all orders history         | Yes            |
| GET    | `/api/orders/order-history/user` | Get order history of logged-in user | Yes    |
| GET    | `/api/orders/phone/:phone` | Get order history by phone number | No             |
| PATCH  | `/api/orders/:orderId`  | Update order status                   | Yes            |
| POST   | `/api/cart/`            | Add item to cart                      | Yes            |
| GET    | `/api/cart/`            | Get cart items                        | Yes            |
| PATCH  | `/api/cart/:id`         | Update cart quantity                  | Yes            |
| DELETE | `/api/cart/`            | Clear entire cart                     | Yes            |
| DELETE | `/api/cart/:id`         | Delete item from cart                 | Yes            |

---

## Notes
- Ensure MongoDB is running and the `MONGO_URI` is correctly set in the `.env` file.
- Use Postman or an API testing tool to test API endpoints.
- The frontend communicates with the backend via API requests to `http://localhost:5000`.
- For production, update the frontend's environment file to point to the deployed backend URL.

---


