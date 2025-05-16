# OAuth2 Authorization Server

This is a basic OAuth2 authorization server built using Node.js, Express, and MySQL. It supports:

- **Authorization Code Grant flow**
- **Access token issuance and refreshing**
- **Protected resource access using bearer tokens**

## 🛠️ Features

- **POST /authorize** – Generate authorization code after validating user, client, and scope.
- **POST /token** – Exchange authorization code for access and refresh tokens.
- **POST /refresh** – Get a new access token using a refresh token.
- **GET /protected-resource** – Access a protected resource with a valid access token.
- **GET /v2/user-profile** – Extend with user profile support (from `userController`).

## 📁 Project Structure

├── app.js
├── config
│ └── db.js
├── controllers
│ └── authController.js
│ └── userController.js
├── routes
│ └── authRoutes.js
├── utils
│ └── tokenService.js
└── .env


## 🧑‍💻 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/oauth2-server.git
cd oauth2-server
2. Install Dependencies

npm install

3. Configure Environment Variables
Create a .env file in the root directory:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=yourdatabase
JWT_SECRET=your_jwt_secret_key

4. Setup MySQL Database
Run the following schema:

CREATE TABLE oauthdetails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clientId VARCHAR(255) NOT NULL,
  redirectURI VARCHAR(255) NOT NULL,
  scope VARCHAR(255) NOT NULL
);

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE authorization_code (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  clientId VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL
);

Insert sample data:

INSERT INTO oauthdetails (clientId, redirectURI, scope)
VALUES ('abc123', 'https://example.com/cb', 'openid profile');

INSERT INTO user (username, email)
VALUES ('john', 'amit.tyagi@gmail.com');

5. Start the Server
node app.js

The server will be running at:

📍 http://localhost:3000

🔌 API Endpoints
1. POST /authorize
Issue an authorization code.

Request Body:

{
  "clientId": "abc123",
  "redirectURI": "https://example.com/cb",
  "userId": "1",
  "scope": "openid profile"
}

Response:
{
  "code": "generated-code",
  "redirect_uri": "https://example.com/cb"
}

etc.............

🔐 Token Structure
Tokens are JWTs signed with process.env.JWT_SECRET.

Access Tokens contain user details, audience, issuer, etc.

Refresh Tokens contain minimal claims.

📌 Notes
This is a minimal OAuth2 server implementation primarily for educational or internal use.

Not production-hardened — for secure deployments, you’ll need features like PKCE, HTTPS, logging, input validation, rate limiting, and token revocation.


