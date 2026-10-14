require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();


app.use(express.json());


async function connectDatabase() {
  await mongoose.connect(
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blogDB",
  );

  console.log("Connected to MongoDB");
  console.log("Database: blogDB");
}


const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
});


const Blog = mongoose.model("Blog", blogSchema);


app.post("/blogs", async (request, response) => {
  try {
    const { title, description, author } = request.body;

    const blog = new Blog({
      title,
      description,
      author,
    });

    const savedBlog = await blog.save();

    response.status(201).json({
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return response.status(400).json({
        error: error.message,
      });
    }

    console.error(error);
    response.status(500).json({
      error: "Failed to create blog",
    });
  }
});


app.get("/blogs", async (request, response) => {
  try {
    const blogs = await Blog.find();

    response.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to retrieve blogs",
    });
  }
});


app.get("/blogs/:id", async (request, response) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({
        error: "Invalid blog ID",
      });
    }

    const blog = await Blog.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({
        error: "Blog not found",
      });
    }

    response.status(200).json(blog);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to retrieve blog",
    });
  }
});


app.delete("/blogs/:id", async (request, response) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      return response.status(400).json({
        error: "Invalid blog ID",
      });
    }

    const blog = await Blog.findByIdAndDelete(request.params.id);

    if (!blog) {
      return response.status(404).json({
        error: "Blog not found",
      });
    }

    response.status(200).json({
      message: "Blog deleted successfully",
      blog,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to delete blog",
    });
  }
});


connectDatabase()
  .then(() => {
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  });
