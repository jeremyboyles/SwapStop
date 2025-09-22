import { useEffect, useMemo, useState } from "react";

/**
 * SwapStop — React Skeleton (simple, single-file UI)
 * - Matches doc aesthetic (green/black/white, rounded, grid)
 * - Uses only your existing endpoints:
 *   POST /users/
 *   GET  /users/?skip=&limit=
 *   DELETE /users/{id}
 *   POST /users/{user_id}/items/
 *   GET  /users/{user_id}/items/
 *   GET  /items/?skip=&limit=
 *   DELETE /items/{item_id}
 *
 * Set API_BASE = "" to use same origin (recommended if served by FastAPI).
 * Otherwise set to "http://127.0.0.1:8000" and enable CORS in FastAPI.
 */

const API_BASE = ""; // "" = same-origin; or "http://127.0.0.1:8000"

async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new Error(
      `[${res.status}] ${typeof body === "string" ? body : JSON.stringify(body)}`
    );
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
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
  // Pure placeholders for now—this mirrors the visual style in the doc.
  const cards = useMemo(() => Array.from({ length: 6 }), []);
  return (
    <>
      <Section>
        <h2>Home Feed</h2>
        <p className="muted">
          Newest listings & recommendations (placeholder cards to match the
          mockup; wire up later if you add a home endpoint).
        </p>
      </Section>
      <div className="grid">
        {cards.map((_, i) => (
          <div className="card" key={i}>
            <div className="thumb" />
            <div className="title">Sample Item {i + 1}</div>
            <div className="rowline">
              <span>${(99 + i).toFixed(2)}</span>
              <span className="badge">cash</span>
            </div>
            <p className="muted">Short description...</p>
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

function Users() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  if (showSignUp) {
    return <SignUpPage onBackToLogin={() => setShowSignUp(false)} />;
  }

  if (showForgot) {
    return <ForgotPasswordPage onBackToLogin={() => setShowForgot(false)} />;
  }

  return (
    <div className="login-wrapper">
      <Section title="Login to SwapStop">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="actions">
          <button className="btn" onClick={() => setStatus("Login button clicked")}>
            Login
          </button>
          <button className="btn outline" onClick={() => setShowForgot(true)}>
            Forgot Password?
          </button>
        </div>

        {status && <p className="muted">{status}</p>}
      </Section>

      <Section>
        <p className="muted">
          Don’t have an account?{" "}
          <button className="btn outline" onClick={() => setShowSignUp(true)}>
            Sign up here
          </button>
        </p>
      </Section>
    </div>
  );
}



function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleReset = () => {
    if (!email) {
      setStatus("Please enter your email to reset password.");
    } else {
      // Placeholder: replace with actual API call
      setStatus(`Password reset link sent to ${email}.`);
    }
  };

  return (
    <div className="forgot-wrapper">
      <Section title="Reset Your Password">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="actions">
          <button className="btn" onClick={handleReset}>
            Send Reset Link
          </button>
          <button className="btn outline" onClick={onBackToLogin}>
            Back to Login
          </button>
        </div>
        {status && <p className="muted">{status}</p>}
      </Section>
    </div>
  );
}



function SignUpPage({ onSignUp, onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="signup-wrapper">
      <Section title="Create an Account">
        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="actions">
          <button className="btn" onClick={() => { setStatus("Sign Up clicked"); onSignUp(); }}>
            Sign Up
          </button>
          <button className="btn outline" onClick={onBackToLogin}>
            Back to Login
          </button>
        </div>

        {status && <p className="muted">{status}</p>}
      </Section>
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

export default function App() {
  const [tab, setTab] = useState("home");

  useEffect(() => {
    // default to home
  }, []);

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
        {tab === "home" && <HomeSkeleton />}
        {tab === "users" && <Users />}
        {tab === "items" && <Items />}

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
