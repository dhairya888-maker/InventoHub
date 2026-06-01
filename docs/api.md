# API Reference

Base URL: `/api/v1`

Interactive docs are available at `/docs` when the backend is running.

## Health

- `GET /health`

## Products

- `POST /products` - create a product
- `GET /products` - list products with pagination, search, and sorting
- `GET /products/low-stock` - list low-stock products
- `GET /products/{id}` - fetch one product
- `PUT /products/{id}` - update one product
- `DELETE /products/{id}` - delete one product

## Customers

- `POST /customers` - create a customer
- `GET /customers` - list customers with pagination and search
- `GET /customers/{id}` - fetch one customer
- `PUT /customers/{id}` - update one customer
- `DELETE /customers/{id}` - delete one customer

## Orders

- `POST /orders` - create an order and deduct inventory
- `GET /orders` - list orders with pagination and status filtering
- `GET /orders/history` - filter order history
- `GET /orders/{id}` - fetch one order with line items

## Dashboard

- `GET /dashboard/stats`
- `GET /dashboard/revenue-chart`
- `GET /dashboard/order-trends`
- `GET /dashboard/low-stock`
- `GET /dashboard/recent-orders`
