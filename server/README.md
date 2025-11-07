# Syntax Club - Backend API Documentation

This document provides a comprehensive guide to the backend API for the Syntax Club application. It is intended for frontend developers who will be consuming these endpoints.

## Table of Contents

1.  [Features](#features)
2.  [Tech Stack](#tech-stack)
3.  [Prerequisites](#prerequisites)
4.  [Installation & Setup](#installation--setup)
5.  [Running the Server](#running-the-server)
6.  [API Endpoint Documentation](#api-endpoint-documentation)
    - [Authentication (Admin & Member)](#authentication-admin--member)
    - [Members](#members)
    - [Applications](#applications)
    - [Arvantis Fest](#arvantis-fest)
    - [Events](#events)
    - [Tickets](#tickets)
    - [Contact](#contact)
    - [Socials](#socials)
7.  [Standard API Responses](#standard-api-responses)

---

## Features

- **Role-Based Access Control**: Differentiated access for Admins and Members.
- **JWT Authentication**: Secure, token-based authentication.
- **Full CRUD Operations**: For all major resources including Members, Events, and Fests.
- **File Uploads**: Integrated with Cloudinary for media and document handling.
- **Advanced Data Management**: Pagination, filtering, and sorting for list endpoints.
- **Analytics & Reporting**: Endpoints for generating statistics and exporting data.
- **Graceful Shutdown**: Ensures data integrity during server termination.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Real-time**: (Potentially Socket.IO if needed)
- **Security**: Helmet, HPP, Express-Mongo-Sanitize, CORS
- **Validation**: express-validator

## Prerequisites

- Node.js (v18.x or later)
- npm or yarn
- MongoDB instance (local or cloud-based like MongoDB Atlas)
- Cloudinary account for media storage
- Redis instance (optional, for rate limiting)

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```
2.  **Navigate to the server directory:**
    ```bash
    cd Syntax_Club/server
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Create the environment file:**
    Create a file named `.env` in the `server` directory and populate it with the following variables.

    ```env
    # Server Configuration
    PORT=8000
    NODE_ENV=development # development or production

    # Database
    MONGODB_URI="your_mongodb_connection_string"

    # Security & JWT
    ACCESS_TOKEN_SECRET="your_strong_access_token_secret"
    ACCESS_TOKEN_EXPIRY="1d"
    REFRESH_TOKEN_SECRET="your_strong_refresh_token_secret"
    REFRESH_TOKEN_EXPIRY="10d"
    ADMIN_SECRET="a_secret_key_for_admin_login"

    # Cloudinary Credentials
    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

    # CORS
    CORS_ORIGIN="http://localhost:3000" # Your frontend URL

    # Rate Limiting (Optional)
    REDIS_URL="your_redis_connection_string"
    ```

## Running the Server

- **Development Mode** (with hot-reloading):
    ```bash
    npm run dev
    ```
- **Production Mode**:
  `bash
    npm start
    `
  The server will be running at `http://localhost:8000`.

---

## API Endpoint Documentation

**Base URL**: `/api/v1`

### Authentication (Admin & Member)

#### Admin Routes (`/admin`)

- **`POST /admin/register`**
    - **Description**: Creates a new admin account.
    - **Access**: Public (should be restricted in production).
    - **Body**: `{ "fullname": "string", "password": "string" }`

- **`POST /admin/login`**
    - **Description**: Logs in an admin.
    - **Access**: Public.
    - **Body**: `{ "fullname": "string", "password": "string", "secret": "string" }`

- **`POST /admin/logout`**
    - **Description**: Logs out the currently authenticated admin.
    - **Access**: Admin.

- **`GET /admin/me`**
    - **Description**: Retrieves the profile of the currently logged-in admin.
    - **Access**: Admin.

#### Member Routes (`/members`)

- **`POST /members/login`**
    - **Description**: Logs in a member. Can use `LpuId` or `email`.
    - **Access**: Public.
    - **Body**: `{ "LpuId": "string", "password": "string" }` OR `{ "email": "string", "password": "string" }`

- **`POST /members/logout`**
    - **Description**: Logs out the currently authenticated member.
    - **Access**: Member, Admin.

- **`GET /members/me`**
    - **Description**: Retrieves the profile of the currently logged-in member.
    - **Access**: Member.

### Members

**Base URL**: `/api/v1/members`

- **`GET /getall`**: Get a list of all members.
- **`GET /getleaders`**: Get a list of members with leadership roles.
- **`POST /register`**: (Admin) Register a new member.
- **`PUT /:id/update`**: (Member) Update their own profile.
- **`PUT /:id/admin`**: (Admin) Update any member's profile.
- **`POST /:id/profile-picture`**: (Member) Upload a profile picture. (Multipart/form-data, field: `profilePicture`)
- **`POST /:id/resume`**: (Member) Upload a resume. (Multipart/form-data, field: `resume`)
- **`PUT /:id/ban`**: (Admin) Ban a member.
- **`PUT /:id/unban`**: (Admin) Unban a member.
- **`PUT /:id/remove`**: (Admin) Mark a member as removed.

### Applications

**Base URL**: `/api/v1/apply`

- **`POST /`**: (Public) Submit a new application for club membership.
- **`GET /`**: (Admin) Get all applications with filtering and pagination.
- **`GET /stats`**: (Admin) Get statistics about applications.
- **`GET /:id`**: (Admin) Get a single application by ID.
- **`PATCH /:id/status`**: (Admin) Update an application's status (`approved`, `rejected`, `pending`).
- **`PATCH /:id/seen`**: (Admin) Mark an application as seen.
- **`PATCH /bulk/status`**: (Admin) Bulk update status of multiple applications.
- **`DELETE /:id`**: (Admin) Delete an application.

### Arvantis Fest

**Base URL**: `/api/v1/arvantis`

- **`GET /landing`**: (Public) Get data for the landing page (current or last completed fest).
- **`GET /`**: (Public) Get a paginated list of all fests.
- **`GET /:identifier`**: (Public) Get full details for a fest by slug or year.
- **`POST /`**: (Admin) Create a new fest record.
- **`PATCH /:identifier/details`**: (Admin) Update core details of a fest.
- **`DELETE /:identifier`**: (Admin) Delete a fest and all its associated media.
- **`GET /export/csv`**: (Admin) Export all fest data as a CSV file.
- **`GET /analytics/overview`**: (Admin) Get year-over-year analytics.
- **`GET /statistics/overview`**: (Admin) Get high-level statistics.
- **`GET /reports/:identifier`**: (Admin) Generate a detailed report for a single fest.
- **`POST /:identifier/partners`**: (Admin) Add a partner. (Multipart/form-data, field: `logo`)
- **`DELETE /:identifier/partners/:partnerName`**: (Admin) Remove a partner.
- **`POST /:identifier/events`**: (Admin) Link an existing event to the fest.
- **`DELETE /:identifier/events/:eventId`**: (Admin) Unlink an event.
- **`PATCH /:identifier/poster`**: (Admin) Upload/update the main fest poster. (Multipart/form-data, field: `poster`)
- **`POST /:identifier/gallery`**: (Admin) Add media to the gallery. (Multipart/form-data, field: `media`, multiple files)
- **`DELETE /:identifier/gallery/:publicId`**: (Admin) Remove a media item from the gallery.

### Events

**Base URL**: `/api/v1/events`

- **`GET /`**: (Public) Get all events with filtering and pagination.
- **`GET /:id`**: (Public) Get a single event by its ID.
- **`POST /`**: (Admin) Create a new event. (Multipart/form-data, field: `posters`, multiple files)
- **`PATCH /:id/details`**: (Admin) Update an event's details.
- **`DELETE /:id`**: (Admin) Delete an event.
- **`GET /admin/statistics`**: (Admin) Get statistics about all events.
- **`GET /:id/registrations`**: (Admin) Get a list of all users registered for an event.
- **`POST /:id/posters`**: (Admin) Add a new poster to an event. (Multipart/form-data, field: `poster`)
- **`DELETE /:id/posters/:publicId`**: (Admin) Remove a poster from an event.

### Tickets

**Base URL**: `/api/v1/tickets`

- **`POST /register`**: (Public) Register for an event and create a ticket.
- **`POST /check-availability`**: (Public) Check if an email or LPU ID is already registered for an event.
- **`GET /:ticketId`**: (Public) Get a ticket by its unique ticket ID.
- **`GET /`**: (Admin) Get tickets by event with filtering.
- **`PATCH /:ticketId/status`**: (Admin) Update a ticket's status (`active`, `used`, `cancelled`).
- **`DELETE /:ticketId`**: (Admin) Delete a ticket.

### Contact

**Base URL**: `/api/v1/contact`

- **`POST /send`**: (Public) Submit a contact form message.
- **`GET /`**: (Admin) Get all contact messages.
- **`GET /stats`**: (Admin) Get statistics about contacts.
- **`GET /:id`**: (Admin) Get a single contact message by ID.
- **`PATCH /:id/status`**: (Admin) Update a contact's status (`pending`, `resolved`, `closed`).
- **`DELETE /`**: (Admin) Bulk delete contacts.
- **`DELETE /:id`**: (Admin) Delete a single contact.

### Socials

**Base URL**: `/api/v1/socials`

- **`GET /`**: (Public) Get all social posts.
- **`GET /:id`**: (Public) Get a single post by ID.
- **`POST /`**: (Admin) Create a new post. (Multipart/form-data, field: `media`)
- **`DELETE /:id`**: (Admin) Delete a post.

---

## Standard API Responses

The API uses a standardized JSON response format.

#### Success Response

```json
{
	"statusCode": 200,
	"data": {
		"key": "value"
	},
	"message": "Success message",
	"success": true
}
```

#### Error Response

```json
{
	"statusCode": 404,
	"message": "Error message",
	"errors": [{ "field": "Error details" }],
	"success": false
}
```
