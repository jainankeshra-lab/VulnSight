import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const isValidURL =
    url.startsWith("http://") || url.startsWith("https://");

  const handleScan = async () => {
    if (!isValidURL) return;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/scan?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();

      if (Array.isArray(data)) setResults(data);
      else if (data.results) setResults(data.results);
      else setResults([]);
    } catch {
      setResults([]);
    }

    setLoading(false);
  };

  const high = results?.filter(r => r.risk === "High").length || 0;
  const medium = results?.filter(r => r.risk === "Medium").length || 0;

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>VulnSight</h1>

        <p style={styles.sideSub}>SECURITY</p>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* 🔥 BIG SEARCH BAR */}
        <div style={styles.searchSection}>
          <input
            style={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter target URL (http://localhost/DVWA/...)"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />

          <button
            style={styles.scanBtn}
            onClick={handleScan}
            disabled={!isValidURL || loading}
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <h2 style={{ color: "#ef4444" }}>{results ? high : "—"}</h2>
            <p>CRITICAL / HIGH</p>
          </div>

          <div style={styles.statBox}>
            <h2 style={{ color: "#facc15" }}>{results ? medium : "—"}</h2>
            <p>MEDIUM</p>
          </div>

          <div style={styles.statBox}>
            <h2 style={{ color: "#22c55e" }}>
              {results ? results.length : "—"}
            </h2>
            <p>PAYLOADS TESTED</p>
          </div>
        </div>

        {/* ALERT */}
        {results && results.length > 0 && (
          <div style={styles.alert}>
            ● {results.length} vulnerability detected — immediate remediation advised
          </div>
        )}

        {/* MAIN GRID */}
        <div style={styles.grid}>

          {/* RESULTS */}
          <div style={{ flex: 2 }}>

            {!results && (
              <div style={styles.empty}>
                <h2>🔍 Ready to Scan</h2>
                <p>Enter a URL above and start scanning</p>
              </div>
            )}

            {results && results.map((r, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3>{r.type}</h3>
                  <span style={styles.badge}>{r.risk}</span>
                </div>

                <p><b>URL:</b> {r.url}</p>
                <p><b>Payload:</b> {r.payload}</p>

                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <b>Description</b>
                    <p>{r.description}</p>
                  </div>

                  <div style={styles.infoBox}>
                    <b>Impact</b>
                    <p>{r.impact}</p>
                  </div>

                  <div style={styles.infoBox}>
                    <b>Fix</b>
                    <p>{r.fix}</p>
                  </div>
                </div>
              </div>
            ))}

            {results && results.length === 0 && (
              <div style={styles.safe}>
                ✅ No vulnerabilities found
              </div>
            )}

          </div>

          {/* 🔥 RIGHT SIDEBAR */}
          <div style={styles.rightPanel}>

            {/* SAMPLE TARGETS */}
            <div style={styles.panelBox}>
              <h3>Sample Targets</h3>

              <button
                style={styles.sampleBtn}
                onClick={() =>
                  setUrl("http://localhost/DVWA/vulnerabilities/xss_r/?name=test")
                }
              >
                XSS Target
              </button>

              <button
                style={styles.sampleBtn}
                onClick={() =>
                  setUrl("http://localhost/DVWA/vulnerabilities/sqli/?id=1")
                }
              >
                SQLi Target
              </button>
            </div>

            {/* PAYLOAD GUIDE */}
            <div style={styles.panelBox}>
              <h3>Payload Guide</h3>

              <p>{"<script>alert(1)</script>"}</p>
              <p>{"' OR '1'='1"}</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    display: "flex",
    background: "#020617",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Segoe UI",
  },

  sidebar: {
    width: "260px",
    padding: "30px",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  },

  /* 🔥 BIGGER LOGO */
  logo: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#22c55e",
    textShadow: "0 0 12px rgba(34,197,94,0.7)",
  },

  sideSub: {
    color: "#64748b",
    marginTop: "10px",
  },

  main: {
    flex: 1,
    padding: "40px",
  },

  /* 🔥 BIG SEARCH BAR */
  searchSection: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
  },

  input: {
    flex: 1,
    padding: "16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "white",
  },

  scanBtn: {
    padding: "16px 30px",
    background: "#22c55e",
    borderRadius: "12px",
    border: "none",
    color: "white",
    fontWeight: "bold",
  },

  stats: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },

  statBox: {
    flex: 1,
    padding: "20px",
    background: "#0f172a",
    borderRadius: "12px",
  },

  alert: {
    background: "#7f1d1d",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "25px",
  },

  grid: {
    display: "flex",
    gap: "20px",
  },

  rightPanel: {
    width: "300px",
  },

  panelBox: {
    background: "#0f172a",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  /* 🔥 SAMPLE BUTTONS */
  sampleBtn: {
    display: "block",
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    background: "#1e293b",
    border: "none",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },

  card: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  badge: {
    background: "#ef4444",
    padding: "4px 10px",
    borderRadius: "6px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginTop: "15px",
  },

  infoBox: {
    background: "#020617",
    padding: "10px",
    borderRadius: "6px",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: "12px",
  },

  safe: {
    color: "#22c55e",
  },
};

export default App;