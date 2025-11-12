import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "") + "/api";

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      `[${res.status}] ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`
    );
  }
  return data;
}

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="page">
      <header className="header">
        <div className="brand">SwapStop</div>
        <nav className="nav">
          <button
            className={activeTab === "home" ? "tab active" : "tab"}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button
            className={activeTab === "account" ? "tab active" : "tab"}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
          <button
            className={activeTab === "items" ? "tab active" : "tab"}
            onClick={() => setActiveTab("items")}
          >
            Items
          </button>
        </nav>
      </header>

      <main className="wrap">
        {activeTab === "home" && <Home />}
        {activeTab === "account" && <Account />}
        {activeTab === "items" && <Items />}
      </main>
    </div>
  );
}

function Home() {
  return (
    <section className="card">
      <h2>Home</h2>
      <p className="muted">
        Use the Account tab to register, log in, enable 2FA, and manage your
        account. Use the Items tab to view items from the backend.
      </p>
    </section>
  );
}

function Account() {
  const [mode, setMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState("sms");
  const [twoFactorSetupVisible, setTwoFactorSetupVisible] = useState(false);

  const [accountStatus, setAccountStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setMessage("All fields are required.");
      return;
    }
    if (!isStrongPassword(regPassword)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, number, and symbol."
      );
      return;
    }
    setBusy(true);
    try {
      const created = await api("/users/", {
        method: "POST",
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          full_name: regFullName,
        }),
      });
      setMessage("Account created. You can now log in.");
      setMode("login");
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegFullName("");
      setCurrentUser(created);
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    if (!loginIdentifier || !loginPassword) {
      setMessage("Email and password are required.");
      return;
    }
    setBusy(true);
    try {
      const users = await api("/users/?skip=0&limit=100");
      const match = users.find(
        (u) =>
          u.email?.toLowerCase() === loginIdentifier.toLowerCase() ||
          u.username?.toLowerCase() === loginIdentifier.toLowerCase()
      );
      if (!match) {
        setMessage("User not found.");
        setCurrentUser(null);
      } else {
        setCurrentUser(match);
        setAccountStatus("active");
        setMessage("Logged in.");
      }
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setMessage("Logged out.");
  }

  function openTwoFactorSetup() {
    setTwoFactorSetupVisible(true);
  }

  function completeTwoFactorSetup() {
    setTwoFactorEnabled(true);
    setTwoFactorSetupVisible(false);
    setMessage("Two-factor authentication enabled.");
  }

  function disableTwoFactor() {
    setTwoFactorEnabled(false);
    setMessage("Two-factor authentication disabled.");
  }

  function deactivateAccount() {
    setAccountStatus("deactivated");
    setMessage("Account marked as deactivated (UI only).");
  }

  async function deleteAccount() {
    if (!currentUser || !currentUser.id) {
      setMessage("No logged-in user with an id to delete.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete your account?")) {
      return;
    }
    setBusy(true);
    try {
      await api(`/users/${currentUser.id}`, { method: "DELETE" });
      setCurrentUser(null);
      setAccountStatus("deleted");
      setMessage("Account deleted.");
    } catch (err) {
      setMessage(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  if (currentUser) {
    return (
      <section className="card">
        <h2>Account</h2>
        <p>
          Logged in as <strong>{currentUser.username}</strong>{" "}
          <span className="muted">({currentUser.email})</span>
        </p>
        <p className="muted">Status: {accountStatus}</p>

        <div className="section-block">
          <h3>Two-Factor Authentication</h3>
          {!twoFactorEnabled && !twoFactorSetupVisible && (
            <button className="btn" onClick={openTwoFactorSetup}>
              Enable 2FA
            </button>
          )}
          {twoFactorSetupVisible && (
            <div className="panel">
              <p>Select a method:</p>
              <div className="row">
                <label>
                  <input
                    type="radio"
                    name="method"
                    value="sms"
                    checked={twoFactorMethod === "sms"}
                    onChange={(e) => setTwoFactorMethod(e.target.value)}
                  />
                  SMS code
                </label>
                <label>
                  <input
                    type="radio"
                    name="method"
                    value="app"
                    checked={twoFactorMethod === "app"}
                    onChange={(e) => setTwoFactorMethod(e.target.value)}
                  />
                  Authenticator app
                </label>
              </div>
              <p className="muted">
                This is a UI placeholder. Backend verification needs to be
                implemented.
              </p>
              <div className="row">
                <button className="btn" onClick={completeTwoFactorSetup}>
                  Confirm setup
                </button>
                <button
                  className="btn outline"
                  onClick={() => setTwoFactorSetupVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {twoFactorEnabled && !twoFactorSetupVisible && (
            <div className="row">
              <span className="badge">2FA enabled</span>
              <button className="btn outline" onClick={disableTwoFactor}>
                Disable 2FA
              </button>
            </div>
          )}
        </div>

        <div className="section-block">
          <h3>Account Actions</h3>
          <div className="row">
            <button className="btn outline" onClick={deactivateAccount}>
              Deactivate Account
            </button>
            <button className="btn danger" onClick={deleteAccount}>
              Delete Account
            </button>
            <button className="btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>

        {message && <p className="muted">{message}</p>}
        {busy && <p className="muted">Working...</p>}
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Account</h2>
      <div className="tabs-secondary">
        <button
          className={mode === "login" ? "tab secondary active" : "tab secondary"}
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
        >
          Log In
        </button>
        <button
          className={
            mode === "register" ? "tab secondary active" : "tab secondary"
          }
          onClick={() => {
            setMode("register");
            setMessage("");
          }}
        >
          Register
        </button>
      </div>

      {mode === "login" && (
        <form className="form" onSubmit={handleLogin}>
          <label className="lbl">
            Username or Email
            <input
              className="input"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
            />
          </label>
          <label className="lbl">
            Password
            <input
              type="password"
              className="input"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Logging in..." : "Log In"}
          </button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}

      {mode === "register" && (
        <form className="form" onSubmit={handleRegister}>
          <label className="lbl">
            Full Name
            <input
              className="input"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
            />
          </label>
          <label className="lbl">
            Username
            <input
              className="input"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
            />
          </label>
          <label className="lbl">
            Email
            <input
              className="input"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </label>
          <label className="lbl">
            Password
            <input
              className="input"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />
          </label>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create Account"}
          </button>
          {message && <p className="muted">{message}</p>}
        </form>
      )}
    </section>
  );
}

function Items() {
  const [items, setItems] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    setLoading(true);
    setStatus("");
    try {
      const data = await api(
        `/items/?skip=${Number(skip)}&limit=${Number(limit)}`
      );
      setItems(data);
    } catch (err) {
      setStatus(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <section className="card">
      <h2>Items</h2>
      <div className="row">
        <label className="lbl-inline">
          Skip
          <input
            className="input small"
            type="number"
            value={skip}
            onChange={(e) => setSkip(e.target.value)}
          />
        </label>
        <label className="lbl-inline">
          Limit
          <input
            className="input small"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </label>
        <button className="btn" onClick={loadItems} disabled={loading}>
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>
      {status && <p className="muted">{status}</p>}
      <div className="grid">
        {items.map((it) => (
          <div key={it.id} className="card inner">
            <div className="title">
              {it.name} <span className="muted">#{it.id}</span>
            </div>
            <p className="muted">{it.description || "No description."}</p>
            <div className="row">
              <span className="badge">
                ${typeof it.price_estimate === "number"
                  ? it.price_estimate.toFixed(2)
                  : "—"}
              </span>
              <span className="muted">owner #{it.owner_id}</span>
            </div>
          </div>
        ))}
        {!items.length && !loading && (
          <p className="muted">No items found.</p>
        )}
      </div>
    </section>
  );
}

function isStrongPassword(pw) {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

export default App;
