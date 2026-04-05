# Backend Testing Guide

You can use the following endpoints in Postman to test the backend.

**Base URL:** `http://localhost:5000/api/v1`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | API Health Check |
| `GET` | `/opportunities` | Get all opportunities |
| `POST` | `/users/sync` | Sync Clerk User (Private) |
| `GET` | `/users/me` | Current User Info (Private) |

Detailed documentation can be found in the [API Endpoints Artifact](file:///home/yaikob-wasihun/.gemini/antigravity/brain/80c1102d-62f5-4492-8436-c53187ead081/artifacts/api_endpoints.md).

> [!IMPORTANT]
> Ensure your MongoDB Atlas IP whitelist is updated if you encounter connection errors.
