# Kanban Board Project

A simple Kanban board application built with Angular and NestJS.

## Project Structure

- `kanban_frontend/` - Angular frontend application
- `kanban_backend/` - NestJS backend application

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup and Running

### Backend (NestJS)

1. Navigate to the backend directory:
   ```bash
   cd kanban_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

The backend server will run on `http://localhost:3000`

### Frontend (Angular)

1. Navigate to the frontend directory:
   ```bash
   cd kanban_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

The frontend application will be available at `http://localhost:4200`

## Features

- Create and manage Kanban columns
- Create cards with title and description
- Drag and drop cards between columns
- Persistent storage using SQLite database

## Technologies Used

- Frontend:
  - Angular 17
  - Angular Material
  - Angular CDK (Drag and Drop)
  - SCSS for styling

- Backend:
  - NestJS
  - TypeORM
  - SQLite
  - Class Validator
