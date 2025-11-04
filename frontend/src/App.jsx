import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { User } from "lucide-react";
import {
  listUsers,
  createUser,
  deleteUser as deleteUserApi,
  listItems,
  createItemForUser,
  deleteItem as deleteItemApi,
  listUserItems,
} from "./lib/api";

const sampleItems = [
  { id: 1, title: "Red Chair", price: 99.99, image: "/images/item1.jpg", description: "Comfortable red chair." },
  { id: 2, title: "Blue Lamp", price: 49.99, image: "/images/item2.jpg", description: "Outdoor lamp." },
  { id: 3, title: "Green Plant", price: 29.99, image: "/images/item3.jpg", description: "Lush indoor plant." },
  { id: 4, title: "Wooden Table", price: 199.99, image: "/images/item4.jpg", description: "Solid oak table." },
  { id: 5, title: "Notebook", price: 9.99, image: "/images/item5.jpg", description: "Lined notebook for notes." },
  { id: 6, title: "Coffee Mug", price: 14.99, image: "/images/item6.jpg", description: "Ceramic coffee mug." },
];

function Section({ title, children }) {
  return (
    <section className="card">
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <input className="input" {...props} />
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={active ? "tab active" : "tab"} onClick={onClick}>
      {children}
    </button>
  );
}

function HomeSkeleton() {
  return (
    <>
      <section className="card">
        <h2>Home Feed</h2>
        <p className="muted">
          Newest listings & recommendations.
        </p>
      </section>
      <div className="grid">
        {sampleItems.map((item) => (
          <div className="card" key={item.id}>
            <img src={item.image} alt={item.title} className="thumb" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px" }} />
            <div className="title">{item.title}</div>
            <div className="rowline">
              <span>${item.price.toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Users() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");

  function isStrongPassword(password) {
    const pattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]).{8,}$/;
    return pattern.test(password);
  }

  async function login() {
    if (!identifier || !password) {
      setStatus("Username/email and password are required.");
      return;
    }
    setLoading(true);
    try {
      // stub until backend auth exists
      setUser({ username: identifier, admin: false });
      setStatus("");
    } catch (e) {
      setStatus("Login failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function register() {
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setStatus("All fields are required.");
      return;
    }
    if (!isStrongPassword(regPassword)) {
      setStatus(
        "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character."
      );
      return;
    }
    try {
      await createUser({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        full_name: regFullName, // ✅ kept as requested
      });
      setStatus("User created. You can now log in.");
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegFullName("");
      setShowRegister(false);
    } catch (e) {
      setStatus(e.message);
    }
  }

  if (user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <Section title={`Welcome, ${user.username}`}>
            <p>{user.admin ? "Admin access" : "Basic user access"}</p>
          </Section>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="login-container">
        <div className="login-card">
          <Section title="Register">
            <Input label="Full Name" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} />
            <Input label="Username" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} />
            <Input label="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
            <Input label="Password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
            <div className="actions">
              <button className="btn" onClick={register}>Register</button>
              <button className="btn outline" onClick={() => setShowRegister(false)}>Back to Log In</button>
            </div>
            <span className="muted">{status}</span>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <Section title="Log In">
          <Input label="Username or Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="actions">
            <button className="btn" onClick={login} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
            <button className="btn outline" onClick={() => setShowRegister(true)}>
              Register / Create User
            </button>
          </div>
          <span className="muted">{status}</span>
        </Section>
      </div>
    </div>
  );
}

function ItemsTab() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [status, setStatus] = useState("");

  async function loadItems() {
    try {
      const data = await listItems(Number(skip), Number(limit));
      setItems(data);
    } catch (e) {
      setStatus(e.message);
    }
  }

  async function handleDeleteItem(id) {
    if (!confirm(`Delete item #${id}?`)) return;
    try {
      await deleteItemApi(id);
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
            <div className="actions">
              <button className="btn outline" onClick={() => handleDeleteItem(it.id)}>Delete</button>
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
  const [showModal, setShowModal] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <header className="header">
        <nav className="nav">
          <div className="brand">SwapStop</div>
          <div className="header-search">
            <input
              type="text"
              placeholder="Search items..."
              className="header-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() !== "") {
                  setTab("search");
                }
              }}
            />
          </div>
          <div className="spacer" />
          <TabButton active={tab === "home"} onClick={() => setTab("home")}>
            Home
          </TabButton>
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>
            <User size={20} />
          </TabButton>
          <TabButton active={tab === "items"} onClick={() => setTab("items")}>
            Items
          </TabButton>
        </nav>
      </header>

      <main className="wrap">
        {tab === "home" && <HomeSkeleton />}
        {tab === "users" && <Users />}
        {tab === "items" && <Items />}
        <footer className="footer">© 2025 SwapStop</footer>
      </main>
    </div>
  );
}
