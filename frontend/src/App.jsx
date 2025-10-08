import { useEffect, useState } from "react";
import { api } from "./api";
import React from "react";


function TabButton({ active, onClick, children }) {
  return (
    <button className={active ? "tab active" : "tab"} onClick={onClick}>
      {children}
    </button>
  );
}

function HomeTab() {
  // purely visual placeholders for now
  return (
    <>
      <section className="card">
        <h2>Home Feed</h2>
        <p className="muted">
          Newest listings (placeholder cards to match the mockup; wire up later if you add a home endpoint).
        </p>
      </section>
      <div className="grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="card" key={i}>
            <div className="thumb" />
            <div className="title">Sample Item {i + 1}</div>
            <div className="rowline">
              <span>${(99 + i).toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">Short description...</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn">View</button>
              <button className="btn outline">Save</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);

  const [uUsername, setUUsername] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");

  const [selUser, setSelUser] = useState("");
  const [selUserItems, setSelUserItems] = useState("");
  const [userItems, setUserItems] = useState([]);

  const [itemName, setItemName] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const [status, setStatus] = useState("");

  async function loadUsers() {
    const data = await api.listUsers(skip, limit);
    setUsers(data);
    if (data.length && !selUser) setSelUser(String(data[0].id));
    if (data.length && !selUserItems) setSelUserItems(String(data[0].id));
  }

  async function createUser() {
    if (!uUsername || !uEmail || !uPassword) {
      setStatus("All fields are required.");
      return;
    }
    try {
      await api.createUser({ username: uUsername, email: uEmail, password: uPassword });
      setStatus("User created.");
      setUUsername(""); setUEmail(""); setUPassword("");
      await loadUsers();
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function deleteUser(id) {
    if (!confirm(`Delete user #${id}? This also deletes their items.`)) return;
    try {
      await api.deleteUser(id);
      setStatus(`Deleted user ${id}`);
      await loadUsers();
      setUserItems([]);
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function createItem() {
    if (!selUser) return setStatus("Pick a user first.");
    if (!itemName.trim()) return setStatus("Item name is required.");
    try {
      await api.createItemForUser(selUser, {
        name: itemName.trim(),
        description: itemDesc.trim() || null,
        price_estimate: itemPrice ? Number(itemPrice) : null,
      });
      setStatus("Item created.");
      setItemName(""); setItemDesc(""); setItemPrice("");
      await loadUserItems();
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function loadUserItems() {
    if (!selUserItems) return setStatus("Pick a user to load items.");
    const data = await api.listItemsForUser(selUserItems);
    setUserItems(data);
  }

  useEffect(() => {
    loadUsers().catch((e) => setStatus(e.message));
  }, []);

  return (
    <>
      <section className="card">
        <h2>Users</h2>
        <div className="row2">
          <div>
            <label className="lbl">Username</label>
            <input className="input" value={uUsername} onChange={(e) => setUUsername(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Email</label>
            <input className="input" value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
          </div>
        </div>
        <label className="lbl">Password</label>
        <input className="input" type="password" value={uPassword} onChange={(e) => setUPassword(e.target.value)} />
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={createUser}>Create User</button>
          <span className="muted">{status}</span>
        </div>
      </section>

      <section className="card">
        <div className="row2">
          <div>
            <label className="lbl">Skip</label>
            <input className="input" type="number" value={skip} onChange={(e) => setSkip(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Limit</label>
            <input className="input" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn outline" onClick={loadUsers}>Load Users</button>
        </div>
        <table className="table" style={{ marginTop: 10 }}>
          <thead><tr><th>ID</th><th>Username</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td><button className="btn outline" onClick={() => deleteUser(u.id)}>Delete</button></td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan={4} className="muted">No users yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Create Item for Selected User</h3>
        <label className="lbl">User</label>
        <select className="input" value={selUser} onChange={(e) => setSelUser(e.target.value)}>
          <option value="">— pick user —</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.username} (#{u.id})</option>)}
        </select>
        <label className="lbl">Name</label>
        <input className="input" value={itemName} onChange={(e) => setItemName(e.target.value)} />
        <label className="lbl">Description</label>
        <textarea className="input" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
        <label className="lbl">Price Estimate (optional)</label>
        <input className="input" type="number" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} />
        <div style={{ marginTop: 10 }}>
          <button className="btn" onClick={createItem}>Add Item</button>
        </div>
      </section>

      <section className="card">
        <h3>User’s Items</h3>
        <label className="lbl">User</label>
        <select className="input" value={selUserItems} onChange={(e) => setSelUserItems(e.target.value)}>
          <option value="">— pick user —</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.username} (#{u.id})</option>)}
        </select>
        <div style={{ marginTop: 10 }}>
          <button className="btn outline" onClick={loadUserItems}>Load Items</button>
        </div>
        <table className="table" style={{ marginTop: 10 }}>
          <thead><tr><th>ID</th><th>Name</th><th>Price</th></tr></thead>
          <tbody>
            {userItems.map((it) => (
              <tr key={it.id}>
                <td>{it.id}</td>
                <td>{it.name}</td>
                <td>{it.price_estimate ?? ""}</td>
              </tr>
            ))}
            {!userItems.length && <tr><td colSpan={3} className="muted">No items yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  );
}

function ItemsTab() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [status, setStatus] = useState("");

  async function loadItems() {
    const data = await api.listItems(skip, limit);
    setItems(data);
  }

  async function deleteItem(id) {
    if (!confirm(`Delete item #${id}?`)) return;
    try {
      await api.deleteItem(id);
      setStatus(`Deleted item ${id}`);
      await loadItems();
    } catch (e) {
      setStatus(e.message);
    }
  }

  useEffect(() => {
    loadItems().catch((e) => setStatus(e.message));
  }, []);

  return (
    <>
      <section className="card">
        <h2>All Items</h2>
        <div className="row2">
          <div>
            <label className="lbl">Skip</label>
            <input className="input" type="number" value={skip} onChange={(e) => setSkip(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Limit</label>
            <input className="input" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn outline" onClick={loadItems}>Load</button>
          <span className="muted" style={{ marginLeft: 8 }}>{status}</span>
        </div>
      </section>

      <div className="grid">
        {items.map((it) => (
          <div className="card" key={it.id}>
            <div className="thumb" />
            <div className="title">{it.name}</div>
            <div className="rowline">
              <span>${(it.price_estimate ?? 0).toFixed(2)}</span>
              <span className="badge">owner #{it.owner_id}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn outline" onClick={() => deleteItem(it.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <div className="muted">No items found.</div>}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <div className="brand">SwapStop</div>
          <div className="spacer" />
          <TabButton active={tab === "home"} onClick={() => setTab("home")}>Home</TabButton>
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>Users</TabButton>
          <TabButton active={tab === "items"} onClick={() => setTab("items")}>Items</TabButton>
        </nav>
      </header>

      <main className="wrap">
        {tab === "home" && <HomeTab />}
        {tab === "users" && <UsersTab />}
        {tab === "items" && <ItemsTab />}

        <section className="card">
          <pre className="muted" style={{ whiteSpace: "pre-wrap" }}>
            {/* Status/debug area (optional). */}
          </pre>
        </section>

        <footer className="footer">© 2025 SwapStop — React Skeleton</footer>
      </main>
    </div>
  );
}
