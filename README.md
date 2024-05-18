# User List Management and Email Sending API

## Overview

This repository contains the code for a RESTful API designed to manage user lists and send emails to users. The API allows administrators to create lists, add users to lists via CSV upload, and send customized emails to users in the lists.

## Features

- **List Creation**: Admins can create lists with customizable properties.
- **User Addition**: Users can be added to lists via CSV upload.
- **CSV Format**: Supports CSV files with customizable properties for users.
- **Unique Emails**: Ensures that no two users with the same email exist in a list.
- **Error Handling**: Provides detailed error messages and CSV reports for failed user additions.
- 
## Additional Features

In addition to the core functionality, the API also includes the following features:

- **Send Emails to Entire Lists**: Admins can send emails to all users in a list with a single action.
- **Customize Email Content**: Customize email content with placeholders for user properties, allowing for personalized communication.
- **Unsubscribe Mechanism**: Users have the option to unsubscribe from receiving emails, providing control over their email preferences.

## Tech Stack

- Node.js
- Express.js
- MongoDB

## Link where it is deployed
https://email-csv-management.onrender.com/


