# Portfolio Manager Backend

Minimal Spring Boot backend for managing a simple financial portfolio.

## Features

- Create, list, update, and delete portfolio items
- Track item fields: `id`, `ticker`, `quantity`, `assetType`
- Get a simple summary view (position count and quantity totals)
- Uses an in-memory H2 database by default

## API Endpoints

- `GET /api/portfolio-items` - list all items
- `GET /api/portfolio-items/{id}` - get one item by id
- `POST /api/portfolio-items` - create an item
- `PUT /api/portfolio-items/{id}` - update an item
- `DELETE /api/portfolio-items/{id}` - delete an item
- `GET /api/portfolio-items/summary` - portfolio totals

## Example Request

```json
{
  "ticker": "AAPL",
  "quantity": 10,
  "assetType": "STOCK"
}
```

Allowed `assetType`: `STOCK`, `BOND`, `CASH`

## Quick Start

```powershell
cd C:\Users\Administrator\Downloads\hsbcproject\hsbcproject
.\mvnw.cmd spring-boot:run
```

App default URL: `http://localhost:8080`

## Run Tests

```powershell
cd C:\Users\Administrator\Downloads\hsbcproject\hsbcproject
.\mvnw.cmd test
```

## OpenAPI / Swagger UI

- OpenAPI JSON: `http://localhost:8080/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

