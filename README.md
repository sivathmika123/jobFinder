# jobFinder


This project is a Job Portal Application designed to connect job seekers (candidates) with employers (companies). It allows companies to post job listings and candidates to apply for jobs, track their applications, and manage their profiles.

## Features

- **User Authentication**: Sign up and log in for both companies and candidates.
- **Job Management**: Companies can create, read, update, and delete job listings.
- **Application Management**: Candidates can apply for jobs, view their application status, and track their application history.
- **Dashboard**: Personalized dashboards for companies and candidates to manage job postings and applications respectively.
- **Session Management**: User sessions are maintained to ensure secure and personalized user experiences.
- **Flash Messages**: Provides feedback to users for their actions.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Embedded JavaScript templates)
- **Database**: MongoDB, Mongoose
- **Middleware**: express-session, connect-flash, body-parser, multer
- **Styling**: CSS (located in the `public` directory)

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/sivathmika123/job-portal.git
    cd job-portal
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Start MongoDB**: Make sure you have MongoDB installed and running. You can start it using the following command:
    ```bash
    mongod
    ```

4. **Run the application**:
    ```bash
    npm start
    ```

5. **Access the application**: Open your web browser and go to `http://localhost:9990`.

## Directory Structure

- `views/`: Contains the EJS templates for rendering the web pages.
- `public/`: Contains static assets like CSS and images.
- `uploads/`: Directory for storing uploaded files.
- `routes/`: Contains route handlers (currently defined in the main file).
- `models/`: Contains Mongoose schemas and models for database interaction (currently defined in the main file).

## Usage

### Routes

#### Public Routes

- **GET `/`**: Landing page
- **GET `/signup`**: Sign-up page for candidates and companies
- **GET `/login`**: Login page for candidates and companies
- **GET `/about`**: About page
- **GET `/contact`**: Contact page

#### Candidate Routes

- **GET `/candidate`**: Candidate registration page
- **GET `/apply`**: View applied jobs and their statuses
- **POST `/logins`**: Candidate login

#### Company Routes

- **GET `/company`**: Company registration page
- **POST `/job`**: Post a new job
- **GET `/dashboard`**: Company dashboard to manage job postings and applications
- **POST `/logins`**: Company login

#### Job Routes

- **GET `/home`**: Homepage displaying all job listings
- **GET `/job/:id`**: View job details by job ID
- **GET `/jobs`**: View all job listings

### Middleware

- **Session Management**: Ensures that user sessions are maintained securely.
- **Flash Messages**: Provides feedback for user actions (e.g., success, errors).

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes.
    ```bash
    git commit -m "Description of your changes"
    ```
4. Push to the branch.
    ```bash
    git push origin feature-name
    ```
5. Create a pull request on GitHub.



## Contact

For questions or feedback, please contact sivathmika.nukala@gmail.com .

---

Feel free to customize any sections as per your specific needs and details.
