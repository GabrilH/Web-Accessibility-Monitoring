# Web Accessibility Monitoring Platform

## Introduction

This project is a MEAN stack web accessibility monitoring platform developed during the Information Systems Project course. The platform allows webmasters to evaluate and continuously monitor the accessibility of web pages. It provides indicators related to the accessibility of these pages. The project was created using the Agile Development Methodology, based on sprints and user stories to fulfill the functional requirements of the application.

## Features

- Insert websites for accessibility monitoring.
- Specify and validate URLs of web pages to be monitored.
- View registered websites and their details.
- Execute accessibility evaluations using the QualWeb core package.
- View aggregated accessibility indicators.
- Delete websites and pages.
- Generate detailed accessibility evaluation reports.

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: Angular (HTML/CSS/TypeScript)
- **Accessibility Evaluation**: QualWeb core
- **Code Quality**: SonarQube

## Requirements

- Node.js
- MongoDB

## Usage

1. Clone the repository.
2. Navigate to the `BACKEND` directory and install dependencies:
   ```sh
   npm install
   ```
3. Create a .env file in the BACKEND directory with your MongoDB connection string: 
   ``` sh
   USER=<your-mongodb-username> 
   PASSWORD=<your-mongodb-password>
   ```
4. Start the backend server (localhost:3032):
   ```sh
   npm run start
   ```
5. Navigate to the FRONTEND directory and install dependencies:
   ```sh
   npm install
   ```
6. Start the frontend server:
   ```sh
   npm run start
   ```
7. Open your browser and navigate to http://localhost:4200.

## Architecture
During the Software Design course, we conducted an in-depth analysis of the project's architecture, documenting it in the [Software Architecture Document (SAD)](Software%20Architecture%20Document.pdf). The SAD provides a comprehensive overview of the system's architecture, detailing the design decisions, architectural patterns, and the rationale behind them. It serves as a valuable resource for understanding the structure, components, and interactions within the system, ensuring maintainability and scalability.

Additionally, we utilized SonarQube to perform static analysis on the project. It helped us identify quality issues, security vulnerabilities, and potential bugs present in the code.

## Demos

- Sprint 1: https://youtu.be/zEf2dCKR0tg
- Sprint 2: https://youtu.be/6c8u_1bQsWg
- Sprint 3: https://youtu.be/M4h1ITS1DrM

## Contributors
- Guilherme Sousa (fc58170)
- Gabriel Henriques (fc58182)
- Pedro Cascão (fc58232)
