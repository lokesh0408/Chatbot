const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// send and receive messages
app.post("/chat", async (req, res) => {
  const { user_message } = req.body;
  let bot_response;
  if (user_message.toLowerCase().includes("hello")) {
    bot_response = "Hello!, How can I assist you today?";
  } else {
    bot_response = "I am not sure! But I am learning!";
  }

  try {
    //  save messages to the database
    await pool.query(
      "INSERT INTO Messages (user_message, bot_response) VALUES ($1, $2)",
      [user_message, bot_response]
    );
    res.json({ bot_response });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving message");
  }
});

//  retrieve message history
app.get("/messages", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * from messages order by created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving messages");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
