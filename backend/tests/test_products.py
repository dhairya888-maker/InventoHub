"""Tests for Product CRUD operations and business rules."""


class TestCreateProduct:
    """Tests for product creation."""

    def test_create_product_success(self, client, sample_product_data):
        response = client.post("/api/v1/products", json=sample_product_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_product_data["name"]
        assert data["sku"] == sample_product_data["sku"]
        assert data["price"] == sample_product_data["price"]
        assert data["stock_quantity"] == sample_product_data["stock_quantity"]
        assert "id" in data
        assert "created_at" in data

    def test_create_product_duplicate_sku(self, client, sample_product_data):
        client.post("/api/v1/products", json=sample_product_data)
        response = client.post("/api/v1/products", json=sample_product_data)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    def test_create_product_invalid_price(self, client, sample_product_data):
        sample_product_data["price"] = -10
        response = client.post("/api/v1/products", json=sample_product_data)
        assert response.status_code == 422

    def test_create_product_negative_stock(self, client, sample_product_data):
        sample_product_data["stock_quantity"] = -5
        response = client.post("/api/v1/products", json=sample_product_data)
        assert response.status_code == 422

    def test_create_product_missing_name(self, client):
        response = client.post("/api/v1/products", json={
            "sku": "TEST-001",
            "price": 10.0,
        })
        assert response.status_code == 422

    def test_create_product_missing_sku(self, client):
        response = client.post("/api/v1/products", json={
            "name": "Test Product",
            "price": 10.0,
        })
        assert response.status_code == 422


class TestGetProduct:
    """Tests for retrieving products."""

    def test_get_product_success(self, client, created_product):
        product_id = created_product["id"]
        response = client.get(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        assert response.json()["id"] == product_id

    def test_get_product_not_found(self, client):
        response = client.get("/api/v1/products/nonexistent-id")
        assert response.status_code == 404


class TestUpdateProduct:
    """Tests for updating products."""

    def test_update_product_success(self, client, created_product):
        product_id = created_product["id"]
        response = client.put(f"/api/v1/products/{product_id}", json={
            "name": "Updated Mouse",
            "price": 34.99,
        })
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Mouse"
        assert response.json()["price"] == 34.99

    def test_update_product_duplicate_sku(self, client, created_product):
        # Create a second product
        client.post("/api/v1/products", json={
            "name": "Keyboard",
            "sku": "KB-001",
            "price": 49.99,
            "stock_quantity": 100,
        })
        # Try to update first product's SKU to second product's SKU
        response = client.put(f"/api/v1/products/{created_product['id']}", json={
            "sku": "KB-001",
        })
        assert response.status_code == 409

    def test_update_product_not_found(self, client):
        response = client.put("/api/v1/products/nonexistent-id", json={
            "name": "Updated",
        })
        assert response.status_code == 404


class TestDeleteProduct:
    """Tests for deleting products."""

    def test_delete_product_success(self, client, created_product):
        product_id = created_product["id"]
        response = client.delete(f"/api/v1/products/{product_id}")
        assert response.status_code == 200
        # Verify it's deleted
        response = client.get(f"/api/v1/products/{product_id}")
        assert response.status_code == 404

    def test_delete_product_not_found(self, client):
        response = client.delete("/api/v1/products/nonexistent-id")
        assert response.status_code == 404


class TestListProducts:
    """Tests for listing and searching products."""

    def test_list_products_empty(self, client):
        response = client.get("/api/v1/products")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["page"] == 1

    def test_list_products_pagination(self, client):
        # Create 15 products
        for i in range(15):
            client.post("/api/v1/products", json={
                "name": f"Product {i}",
                "sku": f"SKU-{i:03d}",
                "price": 10.0 + i,
                "stock_quantity": 100,
            })

        # Get first page
        response = client.get("/api/v1/products?page=1&page_size=10")
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 15
        assert data["total_pages"] == 2

        # Get second page
        response = client.get("/api/v1/products?page=2&page_size=10")
        data = response.json()
        assert len(data["items"]) == 5

    def test_list_products_search(self, client, created_product):
        response = client.get("/api/v1/products?search=Wireless")
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "Wireless Mouse"

    def test_list_products_sort(self, client):
        client.post("/api/v1/products", json={
            "name": "Alpha Product", "sku": "A-001", "price": 50.0, "stock_quantity": 10,
        })
        client.post("/api/v1/products", json={
            "name": "Beta Product", "sku": "B-001", "price": 25.0, "stock_quantity": 20,
        })

        response = client.get("/api/v1/products?sort_by=name&sort_order=asc")
        items = response.json()["items"]
        assert items[0]["name"] == "Alpha Product"
        assert items[1]["name"] == "Beta Product"


class TestLowStockProducts:
    """Tests for low stock product detection."""

    def test_low_stock_products(self, client):
        client.post("/api/v1/products", json={
            "name": "Low Stock Item", "sku": "LS-001", "price": 10.0, "stock_quantity": 3,
        })
        client.post("/api/v1/products", json={
            "name": "Normal Stock Item", "sku": "NS-001", "price": 10.0, "stock_quantity": 500,
        })

        response = client.get("/api/v1/products/low-stock?threshold=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Low Stock Item"
