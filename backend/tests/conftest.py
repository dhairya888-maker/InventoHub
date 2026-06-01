"""Pytest configuration and fixtures for backend tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test and drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    """Provide a database session for tests."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    """Provide a test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_product_data():
    """Sample product creation data."""
    return {
        "name": "Wireless Mouse",
        "sku": "WM-001",
        "description": "Ergonomic wireless mouse with USB receiver",
        "price": 29.99,
        "stock_quantity": 150,
    }


@pytest.fixture
def sample_customer_data():
    """Sample customer creation data."""
    return {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-0100",
        "address": "123 Main St, Springfield, IL 62701",
    }


@pytest.fixture
def created_product(client, sample_product_data):
    """Create and return a product."""
    response = client.post("/api/v1/products", json=sample_product_data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def created_customer(client, sample_customer_data):
    """Create and return a customer."""
    response = client.post("/api/v1/customers", json=sample_customer_data)
    assert response.status_code == 201
    return response.json()
