# GlanceDash

A mobile note-taking application designed to help users organize their knowledge through notes, folders, and learning tools.

GlanceDash focuses on providing an offline-first experience, allowing users to manage their notes locally and synchronize their data with a remote server.

## Screenshots

<p align="center">
  <img src="images/Screenshot%201.png" width="24%" alt="GlanceDash Screenshot 1" />
  <img src="images/Screenshot%202.png" width="24%" alt="GlanceDash Screenshot 2" />
  <img src="images/Screenshot%203.png" width="24%" alt="GlanceDash Screenshot 3" />
  <img src="images/Screenshot%204.png" width="24%" alt="GlanceDash Screenshot 4" />
</p>

## Features

- **Note Management:** Create, edit, organize, and delete notes.
- **Folder Organization:** Organize notes using folders and a hierarchical structure.
- **Local Storage:** Store data locally using SQLite.
- **Data Synchronization:** Synchronize local data with a remote backend.
- **Authentication:** User authentication using JWT.
- **Offline-first Approach:** Keep local data accessible without requiring a constant internet connection.

## Tech Stack

### Frontend
- React Native
- Expo
- TypeScript
- Expo SQLite

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- PostgreSQL
- JWT Authentication

## Development Status

<details>
<summary><strong>Current development progress</strong></summary>

### Completed
- Note and folder management.
- Local database implementation using SQLite.
- Backend API implementation.
- User authentication.
- Local-to-server data synchronization.

### In Progress
- Improving error handling and API response management.
- Implementing network connectivity monitoring.
- Integrating TanStack Query for request and cache management.
- Improving authentication handling, including expired token management.
- Fixing bugs and improving application stability.

### Planned
- Flashcard management.
- Flashcard organization and study workflows.
- AI-assisted flashcard suggestions.
- Learning and review features.

**Current focus:** The synchronization system has been implemented. Development is currently focused on improving application stability, fixing existing issues, and refining the underlying infrastructure before starting the flashcard feature.

</details>

## Getting Started

To run GlanceDash locally, both the backend and frontend must be configured.

### Prerequisites

- Node.js
- Java JDK
- Maven
- PostgreSQL
- Expo development environment

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a PostgreSQL database for the application.

3. Configure your `application.properties` file, located inside `src/main/resources/`.

   Example configuration:

   ```properties
   # Server
   server.port=8080

   # Application
   spring.application.name=noteapp

   # Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/my-note-app
   spring.datasource.username=DB_USERNAME
   spring.datasource.password=DB_PASSWORD

   # JPA / Hibernate
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.defer-datasource-initialization=true

   # Security
   security.jwt.secret-key=${JWT_SECRET_KEY}
   security.jwt.expiration-time=

   # Database Initialization
   spring.sql.init.mode=always

   # CORS
   spring.cors.allowed-origins=
   ```

   Replace the environment variables with your own configuration:

   - `DB_USERNAME`: PostgreSQL username.
   - `DB_PASSWORD`: PostgreSQL password.
   - `JWT_SECRET_KEY`: Secret key used to sign JWT tokens.

   You can configure these variables in your environment or through your IDE's run configuration.

   **Important:** The `spring.jpa.hibernate.ddl-auto` property is set to `update` to avoid automatically dropping the database schema when the application stops. Adjust it according to your development environment and migration strategy.

4. Start the Spring Boot application:

   ```bash
   mvn spring-boot:run
   ```

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Configure the API URL in your Expo configuration file (`app.json`).

   Locate the `extra` property and configure the API endpoint:

   ```json
   "extra": {
     "API_URL": "http://YOUR_SERVER_ADDRESS:8080"
   }
   ```

   Replace `YOUR_SERVER_ADDRESS` with the address where your Spring Boot backend is accessible.

   **Important:** If you are using a physical device, `localhost` will refer to the device itself, not your development computer. Use an address reachable from your device instead.

4. Start the Expo development server:

   ```bash
   npx expo start
   ```

## Project Structure

```text
GlanceDash/
├── backend/
│   └── Spring Boot application
│
├── frontend/
│   └── React Native / Expo application
│
├── images/
│   ├── Screenshot 1.png
│   ├── Screenshot 2.png
│   ├── Screenshot 3.png
│   └── Screenshot 4.png
│
├── .gitignore
└── README.md
```

## License

This project is currently under development.