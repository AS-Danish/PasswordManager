import { clerkClient } from "@clerk/express";
import User from "../models/User.model.js";

export const getUsers = async (req, res) => {
    const userId = req.body.userId;
    try {
        // Fetch user data from Clerk
        const userData = await clerkClient.users.getUser(userId);

        // Extract the necessary data from Clerk response
        const { id, emailAddresses, username, profileImageUrl, firstName, lastName } = userData;

        // Provide default values if data is missing
        const email = emailAddresses[0]?.emailAddress || '';
        const userUsername = username || '';
        const profilePic = profileImageUrl || '';  // Default empty string
        const userFirstName = firstName || '';  // Default empty string
        const userLastName = lastName || '';  // Default empty string

        // Check if the user already exists in the database
        let user = await User.findOne({ clerkId: id });

        if (!user) {
            // If the user doesn't exist, create a new user document
            user = new User({
                clerkId: id,
                email,
                username: userUsername,
                profilePic,
                firstName: userFirstName,
                lastName: userLastName
            });
        

            // Save the new user to the database
            await user.save();
        }

        else{
            console.log("User Already Exits");
        }

        // Respond with the user data
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching or saving user:", error);
        res.status(500).json({ error: 'Failed to fetch or save user' });
    }
};
