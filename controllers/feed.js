exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imagrUrl: "images/book.jpeg",
        creator: {
          name: "Max Schwarz",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.addPost = (req, res, next) => {
  console.log(req.body);
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: { id: new Date().toISOString(), title: title, content: content },
  });
};
