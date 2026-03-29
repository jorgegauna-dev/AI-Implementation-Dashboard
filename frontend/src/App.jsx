import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clients, setClients] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    status: "Active",
    tool: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/clients")
      .then((response) => response.json())
      .then((data) => {
        setClients(data);
      })
      .catch((error) => {
        console.log("Error fetching clients:", error);
      });
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.tool.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const activeCount = clients.filter((client) => client.status === "Active").length;
  const pendingCount = clients.filter((client) => client.status === "Pending").length;
  const inactiveCount = clients.filter((client) => client.status === "Inactive").length;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      industry: "",
      status: "Active",
      tool: "",
    });
    setEditingIndex(null);
  }

function handleSubmit(event) {
  event.preventDefault();

  if (
    formData.name.trim() === "" ||
    formData.industry.trim() === "" ||
    formData.tool.trim() === ""
  ) {
    alert("Please complete all fields");
    return;
  }

  if (editingIndex !== null) {
    fetch(`http://localhost:5000/api/clients/${editingIndex}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(() => {
        const updatedClients = [...clients];
        updatedClients[editingIndex] = { ...formData };
        setClients(updatedClients);
        setEditingIndex(null);
        resetForm();
        setShowForm(false);
      })
      .catch((error) => {
        console.log("Error updating client:", error);
      });

    return;
  }

  fetch("http://localhost:5000/api/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then(() => {
      setClients([...clients, { ...formData }]);
      resetForm();
      setShowForm(false);
    })
    .catch((error) => {
      console.log("Error adding client:", error);
    });
}

  function handleDelete(indexToDelete) {
  fetch(`http://localhost:5000/api/clients/${indexToDelete}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then(() => {
      const updatedClients = clients.filter((_, index) => index !== indexToDelete);
      setClients(updatedClients);
    })
    .catch((error) => {
      console.log("Error deleting client:", error);
    });
}

  function handleEdit(indexToEdit) {
    const clientToEdit = clients[indexToEdit];

    setFormData({
      name: clientToEdit.name,
      industry: clientToEdit.industry,
      status: clientToEdit.status,
      tool: clientToEdit.tool,
    });

    setEditingIndex(indexToEdit);
    setShowForm(true);
    setActiveSection("clients");
  }

  function renderOverview() {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>AI Implementation Dashboard</h1>
            <p>Manage clients, prompts and automations</p>
          </div>
        </div>

        <div className="cards">
          <div className="card">
            <span className="card-label">Total Clients</span>
            <h3>{clients.length}</h3>
            <p>All clients currently in your dashboard</p>
          </div>

          <div className="card">
            <span className="card-label">Active Clients</span>
            <h3>{activeCount}</h3>
            <p>Clients currently active in your workflow</p>
          </div>

          <div className="card">
            <span className="card-label">Pending Clients</span>
            <h3>{pendingCount}</h3>
            <p>Clients waiting for setup or approval</p>
          </div>

          <div className="card">
            <span className="card-label">Inactive Clients</span>
            <h3>{inactiveCount}</h3>
            <p>Clients not currently using any automation</p>
          </div>
        </div>

        <section className="clients-section">
          <div className="section-header">
            <h2>Recent Clients</h2>
            <p>Quick view of the latest client data</p>
          </div>

          <div className="table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Tool</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 5).map((client, index) => (
                  <tr key={index}>
                    <td>{client.name}</td>
                    <td>{client.industry}</td>
                    <td>
                      <span
                        className={`status-badge ${client.status.toLowerCase()}`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td>{client.tool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderClients() {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>Clients</h1>
            <p>Add, edit and manage your AI clients</p>
          </div>

          <button
            className="topbar-button"
            onClick={() => {
              if (showForm) {
                resetForm();
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Close Form" : "New Client"}
          </button>
        </div>

        {showForm && (
          <section className="form-section">
            <h2>{editingIndex !== null ? "Edit Client" : "Add New Client"}</h2>

            <form className="client-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Client name"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="text"
                name="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={handleChange}
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>

              <input
                type="text"
                name="tool"
                placeholder="AI Tool"
                value={formData.tool}
                onChange={handleChange}
              />

              <button type="submit" className="submit-button">
                {editingIndex !== null ? "Update Client" : "Save Client"}
              </button>
            </form>
          </section>
        )}

        <section className="clients-section">
          <div className="section-header">
            <h2>Clients List</h2>
            <p>Search and filter your clients</p>
          </div>

          <div className="filters">
            <input
              type="text"
              className="filter-input"
              placeholder="Search by client, industry or tool"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Tool</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => {
                    const realIndex = clients.findIndex(
                      (item) =>
                        item.name === client.name &&
                        item.industry === client.industry &&
                        item.status === client.status &&
                        item.tool === client.tool
                    );

                    return (
                      <tr key={index}>
                        <td>{client.name}</td>
                        <td>{client.industry}</td>
                        <td>
                          <span
                            className={`status-badge ${client.status.toLowerCase()}`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td>{client.tool}</td>
                        <td className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(realIndex)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(realIndex)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No clients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderAITools() {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>AI Tools</h1>
            <p>Available tools and automations for your clients</p>
          </div>
        </div>

        <div className="cards">
          <div className="card">
            <span className="card-label">Tool</span>
            <h3>Email AI</h3>
            <p>Generate email replies for clients automatically.</p>
          </div>

          <div className="card">
            <span className="card-label">Tool</span>
            <h3>FAQ Bot</h3>
            <p>Answer common client questions using AI workflows.</p>
          </div>

          <div className="card">
            <span className="card-label">Tool</span>
            <h3>Lead Qualifier</h3>
            <p>Organize and classify incoming leads faster.</p>
          </div>
        </div>
      </>
    );
  }

  function renderHistory() {
    return (
      <>
        <div className="topbar">
          <div>
            <h1>History</h1>
            <p>Recent dashboard activity</p>
          </div>
        </div>

        <section className="clients-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <p>Sample timeline of actions</p>
          </div>

          <div className="history-list">
            <div className="history-item">Client NovaTech was added</div>
            <div className="history-item">Email AI tool was assigned</div>
            <div className="history-item">FitGrow status changed to Pending</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>AI Dashboard</h2>

        <ul className="sidebar-menu">
          <li
            className={activeSection === "overview" ? "active" : ""}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </li>
          <li
            className={activeSection === "clients" ? "active" : ""}
            onClick={() => setActiveSection("clients")}
          >
            Clients
          </li>
          <li
            className={activeSection === "ai-tools" ? "active" : ""}
            onClick={() => setActiveSection("ai-tools")}
          >
            AI Tools
          </li>
          <li
            className={activeSection === "history" ? "active" : ""}
            onClick={() => setActiveSection("history")}
          >
            History
          </li>
          <li>Settings</li>
        </ul>
      </aside>

      <main className="main-content">
        {activeSection === "overview" && renderOverview()}
        {activeSection === "clients" && renderClients()}
        {activeSection === "ai-tools" && renderAITools()}
        {activeSection === "history" && renderHistory()}
      </main>
    </div>
  );
}

export default App;