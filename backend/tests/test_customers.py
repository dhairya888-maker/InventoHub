"""Tests for Customer CRUD operations and business rules."""


class TestCreateCustomer:
    """Tests for customer creation."""

    def test_create_customer_success(self, client, sample_customer_data):
        response = client.post("/api/v1/customers", json=sample_customer_data)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == sample_customer_data["name"]
        assert data["email"] == sample_customer_data["email"]
        assert "id" in data

    def test_create_customer_duplicate_email(self, client, sample_customer_data):
        client.post("/api/v1/customers", json=sample_customer_data)
        response = client.post("/api/v1/customers", json=sample_customer_data)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    def test_create_customer_invalid_email(self, client, sample_customer_data):
        sample_customer_data["email"] = "invalid-email"
        response = client.post("/api/v1/customers", json=sample_customer_data)
        assert response.status_code == 422

    def test_create_customer_missing_name(self, client):
        response = client.post("/api/v1/customers", json={
            "email": "test@example.com",
        })
        assert response.status_code == 422


class TestGetCustomer:
    """Tests for retrieving customers."""

    def test_get_customer_success(self, client, created_customer):
        customer_id = created_customer["id"]
        response = client.get(f"/api/v1/customers/{customer_id}")
        assert response.status_code == 200
        assert response.json()["id"] == customer_id

    def test_get_customer_not_found(self, client):
        response = client.get("/api/v1/customers/nonexistent-id")
        assert response.status_code == 404


class TestUpdateCustomer:
    """Tests for updating customers."""

    def test_update_customer_success(self, client, created_customer):
        customer_id = created_customer["id"]
        response = client.put(f"/api/v1/customers/{customer_id}", json={
            "name": "Jane Doe",
            "phone": "+1-555-0200",
        })
        assert response.status_code == 200
        assert response.json()["name"] == "Jane Doe"

    def test_update_customer_duplicate_email(self, client, created_customer):
        # Create second customer
        client.post("/api/v1/customers", json={
            "name": "Jane Smith",
            "email": "jane@example.com",
        })
        # Try to update first customer's email to second's
        response = client.put(f"/api/v1/customers/{created_customer['id']}", json={
            "email": "jane@example.com",
        })
        assert response.status_code == 409


class TestDeleteCustomer:
    """Tests for deleting customers."""

    def test_delete_customer_success(self, client, created_customer):
        customer_id = created_customer["id"]
        response = client.delete(f"/api/v1/customers/{customer_id}")
        assert response.status_code == 200
        response = client.get(f"/api/v1/customers/{customer_id}")
        assert response.status_code == 404

    def test_delete_customer_not_found(self, client):
        response = client.delete("/api/v1/customers/nonexistent-id")
        assert response.status_code == 404


class TestListCustomers:
    """Tests for listing and searching customers."""

    def test_list_customers_empty(self, client):
        response = client.get("/api/v1/customers")
        assert response.status_code == 200
        assert response.json()["total"] == 0

    def test_list_customers_search(self, client, created_customer):
        response = client.get("/api/v1/customers?search=John")
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "John Doe"

    def test_list_customers_pagination(self, client):
        for i in range(15):
            client.post("/api/v1/customers", json={
                "name": f"Customer {i}",
                "email": f"customer{i}@example.com",
            })
        response = client.get("/api/v1/customers?page=1&page_size=10")
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 15
