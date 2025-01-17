const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db.js");
const { AIMessage, HumanMessage } = require("@langchain/core/messages");
const {
  StateGraph,
  MemorySaver,
  Annotation,
  messagesStateReducer,
} = require("@langchain/langgraph");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Define the state annotation
const StateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: messagesStateReducer, // Defines how messages state updates
  }),
});

// Define the function to handle user input and generate bot responses
async function generateResponse(state) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];

  // Simple bot logic
  if (lastMessage.content.toLowerCase().includes("hello")) {
    return { messages: [new AIMessage("Hello! How can I assist you today?")] };
  }
  return { messages: [new AIMessage("I'm not sure! But I'm learning!")] };
}

// Define the workflow
const workflow = new StateGraph(StateAnnotation)
  .addNode("chat", generateResponse)
  .addEdge("__start__", "chat")
  .addEdge("chat", "__end__");

// Initialize memory for the workflow
const memory = new MemorySaver();
const langGraph = workflow.compile({ checkpointer: memory });

// API endpoint for handling chat messages
app.post("/chat", async (req, res) => {
  const { user_message, thread_id } = req.body;

  if (!thread_id) {
    return res.status(400).send("Thread ID is required.");
  }

  try {
    const initialState = {
      messages: [new HumanMessage(user_message)],
    };

    const finalState = await langGraph.invoke(
      initialState,
      { configurable: { thread_id } } // Pass the thread_id here
    );

    const botResponse =
      finalState.messages[finalState.messages.length - 1].content;

    // Save messages to the database
    await pool.query(
      "INSERT INTO Messages (user_message, bot_response, thread_id) VALUES ($1, $2, $3)",
      [user_message, botResponse, thread_id]
    );

    res.json({ bot_response: botResponse });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing the message");
  }
});

app.get("/messages", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM Messages ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving messages");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
