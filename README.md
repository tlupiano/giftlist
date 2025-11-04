# Casanova Project

Casanova is a full-stack application that consists of a backend and a frontend. This README provides an overview of the project structure, setup instructions, and usage guidelines.

## Project Structure

```
casanova
├── backend
│   ├── src
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend
│   ├── Dockerfile
│   └── package.json
├── .env
├── docker-compose.yml
└── README.md
```

## Backend

The backend is built using Node.js and serves as the API for the application.

### Setup

1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

### Docker

To build and run the backend using Docker:

1. Build the Docker image:
   ```
   docker build -t casanova-backend .
   ```
2. Run the Docker container:
   ```
   docker run -p 3000:3000 casanova-backend
   ```

## Frontend

The frontend is built using a modern JavaScript framework (e.g., React, Vue).

### Setup

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm start
   ```

### Docker

To build and run the frontend using Docker:

1. Build the Docker image:
   ```
   docker build -t casanova-frontend .
   ```
2. Run the Docker container:
   ```
   docker run -p 8080:8080 casanova-frontend
   ```

## Environment Variables

Create a `.env` file in the root directory to define environment variables required for the application. This file should include sensitive information such as API keys and database URLs.

## Docker Compose

To run both the backend and frontend together, use Docker Compose:

1. Ensure you have Docker and Docker Compose installed.
2. Run the following command in the root directory:
   ```
   docker-compose up
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.