const mongoose = require("mongoose");
const Blog = require("./models/blog"); // Adjust the path according to your file structure

// Connect to the MongoDB database
mongoose.connect("mongodb+srv://vatsaltiwari1750:qPmcFQbA6adVIjXK@cluster0.ypufd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// Array of categories
const categories = ["Law", "Wildlife", "Education", "Government", "Sports", "Healthcare"];

// Function to create and insert blogs
const createBlogs = async () => {
    try {
        for (const category of categories) {
            const blog = new Blog({
                title: `${category} Blog`,
                content: `This is a blog post about ${category}.`,
                category: category,
            });

            await blog.save();
            console.log(`Blog with category ${category} created!`);
        }
        console.log("All blogs have been created!");
    } catch (err) {
        console.error("Error creating blogs:", err);
    } finally {
        mongoose.connection.close(); // Close the connection after operation
    }
};

// Call the function to create the blogs
createBlogs();
