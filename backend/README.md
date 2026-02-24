# AACP Backend – AI Advertisement Collaboration Platform

Welcome to the backend of the AACP platform. This system connects Business Owners with Advertisers, powered by AI recommendations.

## 🏗 Modular Architecture

The backend follows a modular structure where each feature is self-contained within the `src/modules` directory.

### Directory Structure

- `src/config`: Configuration files (DB, ENV, Auth)
- `src/database`: Mongoose models and migrations
- `src/modules`: Feature-specific logic (Auth, Opportunities, Applications, etc.)
- `src/middlewares`: Global and reusable Express middlewares
- `src/utils`: Helper functions and logging
- `src/jobs`: Background jobs (crons)
- `src/app.js`: Express application setup
- `src/server.js`: Application entry point

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

3. **Run the Server**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm run start
   ```

## 👨‍💻 Developer Responsibilities

- **Developer 1**: Authentication, Payments, Wallet logic.
- **Developer 2 (You)**: Opportunity & Application management, Collaboration workflows, Reviews & Ratings, AI recommendation support.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT & Bcrypt
- **Payments**: Chapa
- **AI**: Gemini API
- **Logging**: Winston & Morgan
