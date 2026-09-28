# SafeVision

**AI-powered helmet detection and road safety monitoring system.**

SafeVision is an AI-powered web application that uses computer vision to detect helmet-related safety violations. Users can upload images, videos, or use live camera detection to analyze riders and identify whether they are wearing helmets.

## Features

* AI-based helmet detection
* Detection of riders with helmets
* Detection of riders without helmets
* Image analysis
* Video analysis
* Live camera detection
* Detection confidence information
* Helmet violation detection
* User registration and login
* Email verification
* Password reset
* User profile
* Analysis history
* Dashboard
* Supabase authentication and database
* FastAPI AI backend
* React web application

---

## Screenshots

### Home Page

<img src="screenshots/home.png" width="800">
<img src="screenshots/home.png" width="800">
<img src="screenshots/home.png" width="800">
<img src="screenshots/home.png" width="800">

### Login Page

<img src="screenshots/login.png" width="800">

### Dashboard

<img src="screenshots/dashboard.png" width="800">
<img src="screenshots/home.png" width="800">

### Detection Results

<img src="screenshots/detection-result.png" width="800">

### History

<img src="screenshots/history.png" width="800">

---

## How SafeVision Works

```text
User
  ↓
SafeVision Web Application
  ↓
Image / Video / Live Camera
  ↓
FastAPI Backend
  ↓
YOLO AI Model (best.pt)
  ↓
Helmet Detection
  ↓
Violation Analysis
  ↓
Detection Results
  ↓
Dashboard / History
```

---

## AI Model

SafeVision uses a trained YOLO-based computer vision model for helmet detection.

**Model:** `best.pt`

**Model location:**

```text
backend/modules/best.pt
```

The `best.pt` file is the trained model used by the backend for detecting helmet-related objects.

The trained model file is **not included in this GitHub repository** because it is a large binary file.

After downloading or cloning the project, place the model at:

```text
backend/modules/best.pt
```

The expected structure is:

```text
backend/
├── modules/
│   └── best.pt
├── services/
├── config.py
└── main.py
```

---

## Image Upload

SafeVision allows users to upload an image and send it to the AI backend for analysis.

A simple HTML example for displaying an uploaded image is:

```html
<img src="screenshots/image-analysis.png" width="800">
```

The actual SafeVision application uses React and TypeScript for image uploading and analysis.

The image analysis process is:

```text
Select Image
     ↓
Upload Image
     ↓
FastAPI Backend
     ↓
best.pt
     ↓
Helmet Detection
     ↓
Violation Analysis
     ↓
Display Results
```

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Python
* FastAPI
* Uvicorn
* Ultralytics YOLO
* OpenCV

### Database & Authentication

* Supabase
* Supabase Authentication
* Supabase Database

### AI / Computer Vision

* YOLO Object Detection
* Computer Vision
* Helmet Detection
* Safety Violation Detection

---

## Project Structure

```text
SafeVision/
│
├── backend/
│   ├── modules/
│   │   └── best.pt
│   │
│   ├── services/
│   │   ├── detector.py
│   │   ├── violations.py
│   │   └── ...
│   │
│   ├── config.py
│   └── main.py
│
├── public/
│
├── screenshots/
│   ├── home.png
│   ├── login.png
│   ├── dashboard.png
│   ├── image-analysis.png
│   ├── video-analysis.png
│   ├── live-detection.png
│   ├── detection-result.png
│   └── history.png
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── integrations/
│   │   └── supabase/
│   ├── lib/
│   └── routes/
│
├── supabase/
│
├── README.md
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── env.example
└── ...
```

---

## Authentication

SafeVision uses Supabase Authentication for user management.

Users can:

* Register an account
* Login
* Verify their email
* Reset their password
* Access their profile
* Maintain an authenticated session

Authentication-related routes include:

```text
/register
/login
/verify-email
/forgot-password
/reset-password
```

---

## Dashboard and History

Authenticated users can access:

```text
/dashboard
/history
/image
/video
/live
/profile
```

The dashboard provides access to the application's analysis features, while the history section allows users to view their previous analysis results.

---

## Supabase

Supabase is used for:

* User authentication
* User management
* Application data
* Analysis and history data

Supabase integration is located in:

```text
src/integrations/supabase/
```

Database configuration and Supabase-related files are located in:

```text
supabase/
```

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_SERVICE_URL=http://localhost:8000
```

**Do not upload `.env` to GitHub.**

Use `env.example` as a template for configuring the project.

---

## Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Go to the project directory:

```bash
cd SafeVision
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
python -m pip install -r "requirements (1).txt"
```

---

## Model Setup

Place the trained YOLO model in:

```text
backend/modules/best.pt
```

The backend expects the model file to be available at this location.

---

## Running the Backend

Open a terminal and run:

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend will run on:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

## Running the Frontend

Open another terminal in the project root:

```bash
npm run dev
```

Vite will provide the local frontend URL in the terminal.

---

## API Endpoints

### Health Check

```text
GET /health
```

Checks whether the backend service is running.

### Image Analysis

```text
POST /api/analyze-image
```

Accepts an image and analyzes it using the `best.pt` AI model.

### Video Analysis

```text
POST /api/analyze-video
```

Processes an uploaded video for helmet detection.

### Live Frame Analysis

```text
POST /api/analyze-frame
```

Processes individual camera frames for live helmet detection.

### Get Results

```text
GET /api/results/{id}
```

Retrieves analysis results.

---

## Detection Workflow

For image analysis, SafeVision follows this process:

```text
Image Upload
     ↓
Backend API
     ↓
best.pt Model
     ↓
Object Detection
     ↓
Helmet Detection
     ↓
Violation Analysis
     ↓
Confidence Information
     ↓
Detection Results
```


## Project Objective

The main objective of SafeVision is to demonstrate the practical use of artificial intelligence and computer vision for helmet safety monitoring.

The project combines:

```text
React
   +
FastAPI
   +
YOLO
   +
OpenCV
   +
Supabase
   +
best.pt
   =
SafeVision
```

---

## Disclaimer

SafeVision is an academic and technical project developed for learning, demonstration, and research purposes.

AI detection results depend on the quality of the input image or video and the capabilities of the trained model.

---

## Author

Developed as an AI and Computer Vision project.
