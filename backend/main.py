from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from urllib.parse import urlparse, parse_qs, urlencode
from bs4 import BeautifulSoup

app = FastAPI()

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Ensure parameter exists (GET)
# -------------------------------
def ensure_param(url):
    if "?" not in url:
        return url + "?test=test"
    return url


# -------------------------------
# REFLECTED XSS (GET)
# -------------------------------
def scan_xss(url):
    payload = "<script>alert(1)</script>"
    results = []
    seen = set()

    url = ensure_param(url)
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    for key in params:
        try:
            test_params = params.copy()
            test_params[key] = payload

            new_query = urlencode(test_params, doseq=True)
            test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{new_query}"

            r = requests.get(test_url, timeout=5)

            if payload in r.text:
                vuln_id = (parsed.path, key)

                if vuln_id not in seen:
                    seen.add(vuln_id)

                    results.append({
                        "type": "Reflected XSS",
                        "risk": "High",
                        "url": test_url,
                        "parameter": key,
                        "payload": payload,
                        "description": "User input is reflected without sanitization.",
                        "impact": "Attacker can execute malicious JavaScript.",
                        "fix": "Sanitize and encode user inputs."
                    })

        except:
            continue

    return results


# -------------------------------
# SQL INJECTION (GET)
# -------------------------------
def scan_sqli_get(url):
    results = []
    seen = set()

    url = ensure_param(url)
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    for key in params:
        try:
            payload = "' OR '1'='1"

            test_params = params.copy()
            test_params[key] = payload

            new_query = urlencode(test_params, doseq=True)
            test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}?{new_query}"

            r = requests.get(test_url, timeout=5)
            text = r.text

            # detect DVWA pattern
            if text.count("First name") > 1 or text.count("Surname") > 1:
                vuln_id = (parsed.path, key)

                if vuln_id not in seen:
                    seen.add(vuln_id)

                    results.append({
                        "type": "SQL Injection (GET)",
                        "risk": "High",
                        "url": test_url,
                        "parameter": key,
                        "payload": payload,
                        "description": "Multiple database records returned after injection.",
                        "impact": "Attacker can bypass authentication and access data.",
                        "fix": "Use parameterized queries."
                    })

        except:
            continue

    return results


# -------------------------------
# SQL INJECTION (FORM / POST)
# -------------------------------
def scan_sqli_form(url):
    results = []

    try:
        session = requests.Session()

        r = session.get(url, timeout=5)
        soup = BeautifulSoup(r.text, "html.parser")

        forms = soup.find_all("form")

        for form in forms:
            payload = "' OR '1'='1"

            inputs = form.find_all("input")
            data = {}

            for inp in inputs:
                name = inp.get("name")
                if name:
                    data[name] = payload

            # send POST request
            res = session.post(url, data=data, timeout=5)
            text = res.text

            if text.count("First name") > 1 or text.count("Surname") > 1:
                results.append({
                    "type": "SQL Injection (Form)",
                    "risk": "High",
                    "url": url,
                    "parameter": "form input",
                    "payload": payload,
                    "description": "SQL injection detected via form submission.",
                    "impact": "Attacker can extract database records.",
                    "fix": "Use parameterized queries."
                })

    except:
        pass

    return results


# -------------------------------
# MAIN SCAN API
# -------------------------------
@app.get("/scan")
def scan(url: str):
    results = []

    results.extend(scan_xss(url))
    results.extend(scan_sqli_get(url))
    results.extend(scan_sqli_form(url))

    if not results:
        return {"message": "No vulnerabilities found"}

    return results