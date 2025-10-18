import { useEffect, useMemo, useState } from "react";
import './App.css';
import { User } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000"; // "" = same-origin; or "http://127.0.0.1:8000"

const sampleItems = [
  { id: 1, title: "Red Chair", price: 99.99, image: "/images/item1.jpg", description: "Comfortable red chair." },
  { id: 2, title: "Blue Lamp", price: 49.99, image: "/images/item2.jpg", description: "Outdoor lamp." },
  { id: 3, title: "Green Plant", price: 29.99, image: "/images/item3.jpg", description: "Lush indoor plant." },
  { id: 4, title: "Wooden Table", price: 199.99, image: "/images/item4.jpg", description: "Solid oak table." },
  { id: 5, title: "Notebook", price: 9.99, image: "/images/item5.jpg", description: "Lined notebook for notes." },
  { id: 6, title: "Coffee Mug", price: 14.99, image: "/images/item6.jpg", description: "Ceramic coffee mug." },
];

async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });

  const text = await res.text(); // read body once
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`[${res.status}] ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }

  return data;
}


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

function Textarea({ label, ...props }) {
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <textarea className="input" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label ? <label className="lbl">{label}</label> : null}
      <select className="input" {...props}>
        {children}
      </select>
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
      <Section>
        <h2>Home Feed</h2>
        <p className="muted">
          Newest listings & recommendations (placeholder cards to match the mockup; wire up later if you add a home endpoint).
        </p>
      </Section>
      <div className="grid">
        {sampleItems.map((item) => (
          <div className="card" key={item.id}>
            <img
              src={item.image}
              alt={item.title}
              className="thumb"
              style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px" }}
            />
            <div className="title">{item.title}</div>
            <div className="rowline">
              <span>${item.price.toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">{item.description}</p>
            <div className="actions">
              <button className="btn">View</button>
              <button className="btn outline">Save</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Users({ active }) {
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Registration fields
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");

  function isStrongPassword(password) {
    // Requires:
    // - At least one uppercase letter
    // - At least one number
    // - At least one special character
    // - Minimum 8 characters total
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
      const user = await api("/login/", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });
      setUser(user);
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

    // 🔒 Check password strength
    if (!isStrongPassword(regPassword)) {
      setStatus(
        "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character."
      );
      return;
    }

    try {
      await api("/users/", {
        method: "POST",
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          full_name: regFullName,
        }),
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


  // If logged in
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

  // If Register form is open
  if (showRegister) {
    return (
      <div className="login-container">
        <div className="login-card">
          <Section title="Register">
            <Input label="Full Name" value={regFullName} onChange={e => setRegFullName(e.target.value)} />
            <Input label="Username" value={regUsername} onChange={e => setRegUsername(e.target.value)} />
            <Input label="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            <Input label="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
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

  // Default Login form
  return (
    <div className="login-container">
      <div className="login-card">
        <Section title="Log In">
          <Input label="Username or Email" value={identifier} onChange={e => setIdentifier(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
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

function Items() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [status, setStatus] = useState("");

  async function loadItems() {
    const data = await api(`/items/?skip=${Number(skip)}&limit=${Number(limit)}`);
    setItems(data);
  }

  async function deleteItem(id) {
    if (!confirm(`Delete item #${id}?`)) return;
    try {
      await api(`/items/${id}`, { method: "DELETE" });
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
      <Section title="All Items">
        <div className="row2">
          <Input label="Skip" type="number" value={skip} onChange={(e) => setSkip(e.target.value)} />
          <Input label="Limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn outline" onClick={loadItems}>Load</button>
          <span className="muted">{status}</span>
        </div>
      </Section>

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
              <button className="btn outline" onClick={() => deleteItem(it.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <div className="muted">No items found.</div>}
      </div>
    </>
  );
}

function SearchPage({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;
    const matches = sampleItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(matches);
  }, [query]);

  return (
    <>
      <Section title={`Search results for "${query}"`}>
        <p className="muted">{results.length} items found.</p>
      </Section>

      <div className="grid">
        {results.map((item) => (
          <div className="card" key={item.id}>
            <img
              src={item.image}
              alt={item.title}
              className="thumb"
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
            <div className="title">{item.title}</div>
            <div className="rowline">
              <span>${item.price.toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">{item.description}</p>
          </div>
        ))}
        {!results.length && <div className="muted">No items found.</div>}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [showModal, setShowModal] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  function handleLoginClick() {
    setShowModal(false);
    setTab("users");
  }

  function handleContinueClick() {
    setShowModal(false);
    setTab("home");
  }

  return (
    <div>
      {/* --- Blurred Welcome Modal --- */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(10px)",          // <-- main blur effect
            WebkitBackdropFilter: "blur(10px)",     // Safari support
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.4s ease-in-out",
          }}
        >
          <div
            className="modal"
            style={{
              background: "#0b3d2e", // deep green
              color: "#f9f9f9",
              padding: "2.5rem 2rem",
              borderRadius: "18px",
              width: "90%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              border: "2px solid #c9b100", // dark yellow border
              transform: "translateY(-10px)",
              animation: "popUp 0.4s ease-out",
            }}
          >
            <h2 style={{ color: "#c9b100", marginBottom: "1rem" }}>Welcome to SwapStop</h2>
            <p style={{ color: "#d8f3dc", fontSize: "1rem" }}>
              Log in to access all features or continue browsing as a guest.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <button
                onClick={handleLoginClick}
                style={{
                  background: "#2d6a4f", // lighter green
                  border: "none",
                  color: "white",
                  padding: "0.8rem 1.4rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#40916c")}
                onMouseLeave={(e) => (e.target.style.background = "#2d6a4f")}
              >
                Log In
              </button>

              <button
                onClick={handleContinueClick}
                style={{
                  background: "transparent",
                  border: "2px solid #c9b100",
                  color: "#c9b100",
                  padding: "0.8rem 1.4rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#c9b100";
                  e.target.style.color = "#0b3d2e";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "#c9b100";
                }}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Navigation --- */}
      <header className="header">
        <nav className="nav">
          <div className="brand">SwapStop</div>

          {/* --- Search Bar in Header --- */}
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
          <TabButton
            active={tab === "home"}
            onClick={() => {
              setTab("home");
              setSearchQuery("");
            }}
          >
            Home
          </TabButton>

          <TabButton
            active={tab === "users"}
            onClick={() => {
              setTab("users");
              setSearchQuery("");
            }}
          >
            <User size={20} style={{ marginRight: "6px" }} />
          </TabButton>

          <TabButton
            active={tab === "items"}
            onClick={() => {
              setTab("items");
              setSearchQuery("");
            }}
          >
            Items
          </TabButton>
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="wrap">
        {tab === "home" && <HomeSkeleton />}
        {tab === "users" && <Users />}
        {tab === "items" && <Items />}
        {tab === "search" && <SearchPage query={searchQuery} />}

        <footer className="footer">© 2025 SwapStop — React Skeleton</footer>
      </main>
    </div>
  );
}