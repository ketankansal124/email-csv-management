const List = require('../models/List');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto');

const User = require('../models/User');

const mailSender = require("../utils/MailSender");

exports.addList = async (req, res) => {
    try {
        const { title, customProperties } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Check if customProperties is provided, otherwise set it to an empty array of objects
        const properties = customProperties || [];

        // Ensure customProperties is an array of objects
        if (!Array.isArray(properties) || !properties.every(prop => typeof prop === 'object')) {
            return res.status(400).json({ error: 'Custom properties must be provided as an array of objects' });
        }

        // Check if a list with the same title already exists
        const existingList = await List.findOne({ title });
        if (existingList) {
            return res.status(400).json({ error: 'A list with the same title already exists' });
        }

        // If no existing list with the same title, create a new one
        const newList = new List({
            title,
            customProperties: properties
        });

        await newList.save();

        res.status(201).json({
            message: 'List created successfully', listId: newList._id
        });
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({
            error: 'Failed to create list'
        });
    }
};


exports.addUsers = async (req, res) => {
    try {
        const listId = req.params.id;
        const filePath = req.file ? req.file.path : null;

        // Check if CSV file is provided
        if (!filePath) {
            return res.status(400).json({ error: 'CSV file is required' });
        }

        // Check if there's a file validation error
        if (req.file.originalname.split('.').pop() != "csv") {
            // Remove the uploaded file
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: "Only Csv files are allowed" });
        }
        const list = await List.findById(listId);

        if (!list) {
            // Remove the uploaded file
            fs.unlinkSync(filePath);
            return res.status(404).json({ error: 'List not found' });
        }

        const { successCount, failureCount, errors } = await processCSV(filePath, list);

        fs.unlinkSync(filePath); // Clean up the uploaded file

        const totalUsers = await User.countDocuments({ listId });
        res.json({ successCount, failureCount, errors, totalUsers });
    } catch (error) {
        console.error('Error adding users:', error);
        res.status(500).json({ error: 'Failed to add users' });
    }
};

const processCSV = async (filePath, list) => {
    const results = [];
    const errors = [];
    let successCount = 0;
    let failureCount = 0;

    await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('error', (error) => reject(error))
            .on('end', () => resolve());
    });

    for (const [index, user] of results.entries()) {
        const { name, email, ...customProps } = user;

        if (!name || !email) {
            errors.push({ line: index + 2, error: 'Name or email missing' });
            failureCount++;
            continue;
        }

        try {
            const existingUser = await User.findOne({ listId: list._id, email });
            if (existingUser) {
                errors.push({ line: index + 2, error: 'Duplicate email' });
                failureCount++;
                continue;
            }

            const token = crypto.randomBytes(20).toString('hex'); // Generate a unique token
            const customProperties = {};
            for (const prop of list.customProperties) {
                customProperties[prop.title] = customProps[prop.title] || prop.defaultValue;
            }

            const newUser = new User({
                listId: list._id,
                name,
                email,
                token,
                customProperties,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await newUser.save();
            successCount++;
        } catch (err) {
            errors.push({ line: index + 2, error: err.message });
            failureCount++;
        }
    }

    return { successCount, failureCount, errors };
};

exports.unsubscribe = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        // Find the user with the provided token
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        if (user.isUnsubscribed) {
            return res.status(400).json({ error: 'User is already unsubscribed' });
        }

        // Set isUnsubscribed field to true
        user.isUnsubscribed = true;

        // Save the user
        await user.save();

        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Error unsubscribing user:', error);
        res.status(500).json({ error: 'Failed to unsubscribe user' });
    }
};

exports.sendMail = async (req, res) => {
    const listId = req.params.id;
    const { subject, body } = req.body;

    try {
        // Check if subject and body are provided
        const list = await List.findById(listId);

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        if (!subject || !body) {
            return res.status(400).json({ error: 'Subject and body are required' });
        }

        // Retrieve all subscribed users in the specified list
        const users = await User.find({ listId, isUnsubscribed: false });

        // Check if users are found
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No subscribed users found' });
        }

        // Prepare personalized emails for each subscribed user
        for (const user of users) {
            let emailBody = body;

            const customPropertiesObj = Object.fromEntries(user.customProperties);

            // Replace placeholders with user's custom properties
            for (const [key, value] of Object.entries(customPropertiesObj)) {
                const placeholder = new RegExp(`\\[${key}\\]`, 'g');
                emailBody = emailBody.replace(placeholder, value || '');
            }

            // Ensure name and email placeholders are replaced
            emailBody = emailBody.replace(/\[name\]/g, user.name);
            emailBody = emailBody.replace(/\[email\]/g, user.email);
            emailBody = emailBody.replace(/\[unsubscribe_link\]/g, `http://localhost:8080/mathongo/v1/lists/unsubscribe/${user.token}`);

            // Send the email using mailSender function
            await mailSender(user.email, subject, emailBody);
        }

        res.json({ message: 'Emails sent successfully to the subscribed users' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Failed to send emails' });
    }
};