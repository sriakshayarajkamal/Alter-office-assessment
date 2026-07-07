require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');



const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");
const listRoutes = require("./routes/list");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use("/api/auth",authRoutes);
app.use("/api/todos",todoRoutes);
app.use("/api/lists",listRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
