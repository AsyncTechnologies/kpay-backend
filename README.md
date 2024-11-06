Installation Requirements
To run this project, you need to have Node.js and npm (Node Package Manager) installed on your machine.

Install Node.js and npm
Download and Install Node.js:

Visit the official Node.js download page and download the latest version of Node.js (which includes npm).
Follow the installation instructions for your operating system.
Verify the Installation:

Open your terminal (or command prompt).

Run the following commands to confirm the installation:

node -v
npm -v
This will output the installed versions of Node.js and npm if everything was installed correctly.


After installing Node.js and npm, follow these steps to set up the project.

Clone the Repository:
git clone https://github.com/AsyncTechnologies/kpay-backend.git
cd kpay-backend


Install Project Dependencies:

Use npm to install all the required packages and dependencies:

npm install


Create a .env file in the root directory of the project and add the necessary environment variables. Here’s what go inside the .env file:

PORT=3001
MONGO_URL= mongodb+srv://mustafailahi586:BjsHnw45dwRaSESH@cluster0.6nqkg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=K$Pay$@321.
NODEMAILER_USER=naeemahmedpnl1@gmail.com
NODEMAILER_PASS=tguzawieloljspzo
STRIPE_SECRET_KEY= YOUR_STRIPE_SECRET_KEY_HERE



Running the Project
To start the backend server, use the following command:

npm start