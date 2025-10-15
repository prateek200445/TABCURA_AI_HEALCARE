# TabCura - Healthcare Management System

![TabCura Dashboard](./newfrontend/public/dashboard.png)

## Overview
TabCura is a modern healthcare management system that combines AI-powered features with traditional medical record management. The platform offers tools for both healthcare providers and patients, making medical care more accessible and efficient. With a special focus on elderly care, TabCura includes a voice-enabled health assistant that allows users to describe their symptoms through natural conversation.

## Demo Screenshots

### Patient Dashboard
![Patient Dashboard](./newfrontend/public/tabcura.png)

### Prescription Analysis
![Prescription Reader](./newfrontend/public/Prescription%20Reader%20Page@1x%20(1).png)

## Features

### For Patients
- **Voice-Enabled Health Assistant**
  - Natural conversation interface for elderly users
  - Voice-based symptom description
  - AI-powered real-time conversation
  - Simplified medical guidance
  - Integration with Voiceflow for natural dialogue
  - Accessible through web interface or mobile devices

- **AI Symptom Checker**
  - Get instant analysis of symptoms
  - Receive urgency level assessments
  - Get recommendations for next steps
  - View possible causes and preventive measures
  - Integration with voice commands for accessibility

- **Prescription Management**
  - Upload and digitize prescriptions
  - AI-powered prescription analysis
  - Historical prescription tracking
  - Digital prescription storage

- **Health Report Analysis**
  - Upload lab reports and medical documents
  - Get AI-powered insights
  - Track health metrics over time
  - Store medical records securely

- **AI Health Assistant Chat**
  - Interactive health guidance
  - Quick medical information
  - 24/7 availability
  - Personalized health recommendations

### For Healthcare Providers
- **Patient Management**
  - Comprehensive patient profiles
  - Medical history tracking
  - Disease categorization
  - Document management

- **AI-Powered Tools**
  - Prescription analysis
  - Report interpretation
  - Symptom analysis assistance
  - Treatment recommendations

## Technology Stack

### Frontend
- React.js
- CSS3 with modern styling
- Responsive design
- Environment-based configuration
- Voiceflow integration for voice interface
- Web Speech API for voice recognition
- Progressive Web App capabilities

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Google's Gemini AI integration

### AI Features
- Symptom analysis using Gemini AI
- Document processing
- Medical report interpretation
- Natural language processing for health data

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Cloud Account (for Gemini AI)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=3001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd newfrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```
   REACT_APP_API_URL=http://localhost:3001
   ```

4. Start the frontend application:
   ```bash
   npm start
   ```

## Docker Deployment
The application can be deployed using Docker and Docker Compose:

```yaml
version: "3.9"
services:
  backend:
    image: prateek2004/backend:latest
    container_name: backend_service
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
      - MONGO_URI=your_mongodb_uri
      - JWT_SECRET=your_jwt_secret
      - NODE_ENV=production
      - GEMINI_API_KEY=your_gemini_api_key
    networks:
      - app-network

  frontend:
    image: prateek2004/frontend:latest
    container_name: frontend_service
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## API Endpoints

### Authentication
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login

### Prescriptions
- POST `/api/prescription/upload` - Upload prescription
- POST `/api/prescription/analyze` - Analyze prescription
- GET `/api/prescription/user/:userId` - Get user prescriptions

### Symptoms
- POST `/api/symptoms/analyze` - Analyze symptoms

### Profile
- GET `/api/profile/:userId` - Get user profile
- PUT `/api/profile/:userId` - Update user profile
- GET `/api/profile/:userId/documents` - Get user documents

## Detailed API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "patient|doctor"
}
```

#### POST `/api/auth/login`
Login existing user
```json
{
  "email": "string",
  "password": "string"
}
```

### Prescription Endpoints

#### POST `/api/prescription/upload`
Upload and analyze prescription
- Content-Type: multipart/form-data
- Required fields:
  - prescription (file)
  - userId (string)

#### POST `/api/prescription/analyze`
Analyze prescription text
```json
{
  "prescriptionText": "string",
  "userId": "string"
}
```

### Symptom Analysis Endpoints

#### POST `/api/symptoms/analyze`
Analyze symptoms with AI
```json
{
  "symptoms": "string",
  "userInfo": {
    "age": "number",
    "gender": "string",
    "existingConditions": "string[]",
    "medications": "string[]"
  }
}
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Backend Connection Issues**
   ```bash
   Error: ECONNREFUSED 127.0.0.1:3001
   ```
   - Check if backend server is running
   - Verify environment variables in .env file
   - Ensure MongoDB connection is active

2. **AI Analysis Errors**
   ```bash
   Error analyzing symptoms
   ```
   - Verify GEMINI_API_KEY in backend .env
   - Check API quota and limits
   - Ensure proper request format

3. **Voice Recognition Issues**
   - Enable microphone permissions in browser
   - Use supported browsers (Chrome, Edge, Firefox)
   - Check internet connectivity

4. **File Upload Errors**
   - Verify file size limits
   - Check supported file formats
   - Ensure proper form data structure

## Development Workflow

### Setting Up Development Environment

1. **Clone and Branch**
   ```bash
   git clone https://github.com/yourusername/TabCura.git
   cd TabCura
   git checkout -b feature/your-feature
   ```

2. **Environment Configuration**
   ```bash
   # Backend (.env)
   PORT=3001
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GEMINI_API_KEY=your_key

   # Frontend (.env)
   REACT_APP_API_URL=http://localhost:3001
   ```

3. **Development Process**
   - Write tests first (TDD approach)
   - Follow code style guidelines
   - Document new features
   - Update README for major changes

4. **Code Review Process**
   - Self-review changes
   - Create detailed PR description
   - Address review comments
   - Update documentation

### Deployment Process

1. **Testing Environment**
   ```bash
   # Backend
   npm run test
   
   # Frontend
   npm run test
   npm run build
   ```

2. **Docker Build**
   ```bash
   # Backend
   docker build -t prateek2004/backend:latest ./backend
   
   # Frontend
   docker build -t prateek2004/frontend:latest ./newfrontend
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## Security Features
- JWT-based authentication
- Password hashing
- Protected routes
- Input validation
- MongoDB injection prevention
- CORS configuration

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
Prateek Lachwani - [@YourTwitter](https://twitter.com/YourTwitter)
Project Link: [https://github.com/yourusername/TabCura](https://github.com/yourusername/TabCura)
