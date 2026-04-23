import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/scan?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();

      if (Array.isArray(data)) setResults(data);
      else setResults([]);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const high = results.filter(r => r.risk === "High").length;
  const medium = results.filter(r => r.risk === "Medium").length;

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{color:"#22c55e"}}>VulnSight</h2>
        <p style={styles.sideSub}>SECURITY</p>

        <div style={styles.menu}>
          <div style={styles.active}>Dashboard</div>
          <div>Scanner</div>
          <div>Reports</div>
          <div>History</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        {/* TOP BAR */}
        <div style={styles.topBar}>
          <input
            style={styles.input}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter target URL"
          />
          <button onClick={handleScan} style={styles.scanBtn}>
            Scan
          </button>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.statBox}>
            <h2 style={{color:"#f43f5e"}}>{high}</h2>
            <p>CRITICAL / HIGH</p>
          </div>

          <div style={styles.statBox}>
            <h2 style={{color:"#facc15"}}>{medium}</h2>
            <p>MEDIUM</p>
          </div>

          <div style={styles.statBox}>
            <h2 style={{color:"#22c55e"}}>{results.length}</h2>
            <p>PAYLOADS TESTED</p>
          </div>
        </div>

        {/* ALERT */}
        {results.length > 0 && (
          <div style={styles.alert}>
            ● {results.length} vulnerability detected — immediate remediation advised
          </div>
        )}

        {/* CONTENT GRID */}
        <div style={styles.grid}>

          {/* RESULTS */}
          <div>
            <h3>SCAN RESULTS</h3>

            {results.map((r, i) => (
              <div key={i} style={styles.card}>
                
                <div style={styles.cardHeader}>
                  <b>{r.type}</b>
                  <span style={styles.badge}>HIGH</span>
                </div>

                <div style={styles.row}>
                  <div>
                    <small>URL</small>
                    <p>{r.url}</p>
                  </div>
                  <div>
                    <small>PAYLOAD</small>
                    <p>{r.payload}</p>
                  </div>
                  <div>
                    <small>METHOD</small>
                    <p>POST / FORM</p>
                  </div>
                </div>

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
                    <b>Remediation</b>
                    <p>{r.fix}</p>
                  </div>
                </div>

              </div>
            ))}

            {results.length === 0 && !loading && (
              <div style={styles.safe}>No vulnerabilities found</div>
            )}

          </div>

          {/* RIGHT PANEL */}
          <div>

            <div style={styles.sideCard}>
              <h4>Severity Breakdown</h4>
              <p>Critical: {high}</p>
              <p>Medium: {medium}</p>
            </div>

            <div style={styles.sideCard}>
              <h4>Sample Targets</h4>
              <button onClick={() => setUrl("http://localhost/DVWA/vulnerabilities/xss_r/?name=test")}>
                XSS Target
              </button>
              <button onClick={() => setUrl("http://localhost/DVWA/vulnerabilities/sqli/")}>
                SQLi Target
              </button>
            </div>

            <div style={styles.sideCard}>
              <h4>Payload Guide</h4>
              <p><code>{"<script>alert(1)</script>"}</code></p>
              <p><code>{"' OR '1'='1"}</code></p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    background: "linear-gradient(135deg, #020617, #020617)",
    color: "white",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },

  sidebar: {
    width: "240px",
    padding: "25px",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    background: "#020617",
  },

  sideSub: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "20px",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  topBar: {
    marginBottom: "25px",
  },

  input: {
    width: "420px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#020617",
    color: "white",
    outline: "none",
  },

  scanBtn: {
    marginLeft: "10px",
    padding: "12px 24px",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    cursor: "pointer",
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
    borderRadius: "12px",
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
  },

  alert: {
    background: "rgba(127,29,29,0.8)",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "25px",
    border: "1px solid rgba(255,0,0,0.3)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
  },

  card: {
    background: "rgba(15,23,42,0.8)",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "16px",
  },

  badge: {
    background: "#ef4444",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "12px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    fontSize: "13px",
    color: "#94a3b8",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginTop: "20px",
  },

  infoBox: {
    background: "#020617",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  sideCard: {
    background: "rgba(15,23,42,0.8)",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  safe: {
    color: "#22c55e",
    marginTop: "20px",
    fontWeight: "bold",
  },
};

export default App;