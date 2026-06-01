"""Tests for Order operations and inventory management."""


class TestCreateOrder:
    """Tests for order creation with inventory deduction."""

    def test_create_order_success(self, client, created_product, created_customer):
        order_data = {
            "customer_id": created_customer["id"],
            "items": [
                {
                    "product_id": created_product["id"],
                    "quantity": 2,
                }
            ],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 201
        data = response.json()
        assert data["customer_id"] == created_customer["id"]
        assert data["status"] == "pending"
        assert data["total_amount"] == 59.98  # 29.99 * 2
        assert len(data["items"]) == 1
        assert data["items"][0]["quantity"] == 2

    def test_create_order_deducts_inventory(self, client, created_product, created_customer):
        initial_stock = created_product["stock_quantity"]
        order_data = {
            "customer_id": created_customer["id"],
            "items": [{"product_id": created_product["id"], "quantity": 5}],
        }
        client.post("/api/v1/orders", json=order_data)

        # Check stock was deducted
        response = client.get(f"/api/v1/products/{created_product['id']}")
        assert response.json()["stock_quantity"] == initial_stock - 5

    def test_create_order_insufficient_stock(self, client, created_product, created_customer):
        order_data = {
            "customer_id": created_customer["id"],
            "items": [{"product_id": created_product["id"], "quantity": 99999}],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 400
        assert "Insufficient stock" in response.json()["detail"]

    def test_create_order_nonexistent_customer(self, client, created_product):
        order_data = {
            "customer_id": "nonexistent-id",
            "items": [{"product_id": created_product["id"], "quantity": 1}],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 404

    def test_create_order_nonexistent_product(self, client, created_customer):
        order_data = {
            "customer_id": created_customer["id"],
            "items": [{"product_id": "nonexistent-id", "quantity": 1}],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 404

    def test_create_order_zero_quantity(self, client, created_product, created_customer):
        order_data = {
            "customer_id": created_customer["id"],
            "items": [{"product_id": created_product["id"], "quantity": 0}],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 422

    def test_create_order_empty_items(self, client, created_customer):
        order_data = {
            "customer_id": created_customer["id"],
            "items": [],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 422

    def test_create_order_multiple_items(self, client, created_customer):
        # Create two products
        p1 = client.post("/api/v1/products", json={
            "name": "Product A", "sku": "PA-001", "price": 10.0, "stock_quantity": 50,
        }).json()
        p2 = client.post("/api/v1/products", json={
            "name": "Product B", "sku": "PB-001", "price": 20.0, "stock_quantity": 50,
        }).json()

        order_data = {
            "customer_id": created_customer["id"],
            "items": [
                {"product_id": p1["id"], "quantity": 3},
                {"product_id": p2["id"], "quantity": 2},
            ],
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 201
        data = response.json()
        assert data["total_amount"] == 70.0  # (10*3) + (20*2)
        assert len(data["items"]) == 2


class TestGetOrder:
    """Tests for retrieving orders."""

    def test_get_order_success(self, client, created_product, created_customer):
        order = client.post("/api/v1/orders", json={
            "customer_id": created_customer["id"],
            "items": [{"product_id": created_product["id"], "quantity": 1}],
        }).json()

        response = client.get(f"/api/v1/orders/{order['id']}")
        assert response.status_code == 200
        assert response.json()["id"] == order["id"]

    def test_get_order_not_found(self, client):
        response = client.get("/api/v1/orders/nonexistent-id")
        assert response.status_code == 404


class TestListOrders:
    """Tests for listing orders."""

    def test_list_orders_empty(self, client):
        response = client.get("/api/v1/orders")
        assert response.status_code == 200
        assert response.json()["total"] == 0

    def test_list_orders_pagination(self, client, created_product, created_customer):
        # Create multiple orders
        for _ in range(5):
            client.post("/api/v1/orders", json={
                "customer_id": created_customer["id"],
                "items": [{"product_id": created_product["id"], "quantity": 1}],
            })

        response = client.get("/api/v1/orders?page=1&page_size=3")
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 5


class TestDashboard:
    """Tests for dashboard endpoints."""

    def test_dashboard_stats_empty(self, client):
        response = client.get("/api/v1/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_products"] == 0
        assert data["total_customers"] == 0
        assert data["total_orders"] == 0
        assert data["total_revenue"] == 0

    def test_dashboard_stats_with_data(self, client, created_product, created_customer):
        client.post("/api/v1/orders", json={
            "customer_id": created_customer["id"],
            "items": [{"product_id": created_product["id"], "quantity": 2}],
        })

        response = client.get("/api/v1/dashboard/stats")
        data = response.json()
        assert data["total_products"] == 1
        assert data["total_customers"] == 1
        assert data["total_orders"] == 1
        assert data["total_revenue"] == 59.98

    def test_revenue_chart(self, client):
        response = client.get("/api/v1/dashboard/revenue-chart")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_order_trends(self, client):
        response = client.get("/api/v1/dashboard/order-trends")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_low_stock_dashboard(self, client):
        client.post("/api/v1/products", json={
            "name": "Low Stock", "sku": "LS-001", "price": 5.0, "stock_quantity": 2,
        })
        response = client.get("/api/v1/dashboard/low-stock")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    def test_recent_orders(self, client):
        response = client.get("/api/v1/dashboard/recent-orders")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestHealthCheck:
    """Tests for health check endpoint."""

    def test_health_check(self, client):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert "InventoHub" in response.json()["name"]
