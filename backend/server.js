const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let clients = [
  {
    name: "NovaTech",
    industry: "Ecommerce",
    status: "Active",
    tool: "Email AI",
  },
  {
    name: "FitGrow",
    industry: "Fitness",
    status: "Pending",
    tool: "Lead Qualifier",
  },
];

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/clients", (req, res) => {
  res.json(clients);
});

app.post("/api/clients", (req, res) => {
  const newClient = req.body;
  clients.push(newClient);

  res.status(201).json({
    message: "Client added successfully",
    client: newClient,
  });
});

app.put("/api/clients/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const updatedClient = req.body;

  if (index < 0 || index >= clients.length) {
    return res.status(404).json({ message: "Client not found" });
  }

  clients[index] = updatedClient;

  res.json({
    message: "Client updated successfully",
    client: updatedClient,
  });
});

app.delete("/api/clients/:index", (req, res) => {
  const index = parseInt(req.params.index);

  if (index < 0 || index >= clients.length) {
    return res.status(404).json({ message: "Client not found" });
  }

  const deletedClient = clients[index];
  clients = clients.filter((_, i) => i !== index);

  res.json({
    message: "Client deleted successfully",
    client: deletedClient,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});