# 🌱 E-Waste EPR Management & Recycling Target Calculator

> **Third-Year Computer Engineering College Mini-Project**  
> Based on India's **E-Waste (Management) Rules, 2022**  
> **100% Free • Zero API Keys • Pure Local Execution**

---

## 📌 Project Objective

The objective of this web application is to provide an interactive, beginner-friendly compliance portal that demonstrates:
1. **Entity Registration & E-Waste Inputs** (Producers, Manufacturers, Recyclers, Refurbishers)
2. **EPR Target Calculation** based on statutory financial year percentages
3. **Registration Fee Slabs Lookup** based on computed EPR target tonnage
4. **Compliance Status Evaluation** comparing actual recycled quantities against mandated targets
5. **Interactive Dashboard & Analytics** for five sample electronic manufacturing entities

---

## 🛠️ Technologies Used

- **Backend:** Python (Flask web framework)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Visualization:** Pure HTML5 Canvas (100% offline, zero external CDN scripts)
- **Data Storage:** In-memory Python data structures (No database or cloud setup required)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.8+ installed on your computer.

### 2. Installation
Open your terminal / VS Code terminal in the project folder and install Flask:

```bash
python -m pip install -r requirements.txt
```

### 3. Run the Application
Start the Flask development server:

```bash
python app.py
```

### 4. Open in Browser
Visit the local server URL:

```text
http://127.0.0.1:5000
```

---

## 📐 Statutory Rules & Formulas

### 1. EPR Target Percentage Schedule

| Financial Year | EPR Target Rate (%) |
| :--- | :--- |
| **2023–24** | 60% |
| **2024–25** | 60% |
| **2025–26** | 70% |
| **2026–27** | 70% |
| **2027–28 onward** | 80% |

#### **Formula:**
$$\text{EPR Target (MT)} = \frac{\text{Annual E-Waste Generated (MT)} \times \text{Target Percentage}}{100}$$

*Example:*
$$80\text{ MT} \times 70\% = 56\text{ MT}$$

---

### 2. Registration Fee Slabs

| EPR Target Quantity (MT) | One-Time Registration Fee |
| :--- | :--- |
| $\text{Target} < 50\text{ MT}$ | **₹2,500** |
| $50 \le \text{Target} < 100\text{ MT}$ | **₹7,500** |
| $100 \le \text{Target} < 1,000\text{ MT}$ | **₹1,50,000** |
| $1,000 \le \text{Target} < 5,000\text{ MT}$ | **₹10,00,000** |
| $\text{Target} \ge 5,000\text{ MT}$ | **₹15,00,000** |

---

### 3. Compliance Status Rule

$$\text{Compliance Logic:}$$

$$\text{Actual Recycled} \ge \text{EPR Target} \implies \textbf{COMPLIANT } \text{(Green Badge 🌱)}$$

$$\text{Actual Recycled} < \text{EPR Target} \implies \textbf{NON-COMPLIANT } \text{(Red Badge ⚠️)}$$

#### **Recycling Difference:**
$$\text{Difference} = \text{Actual Recycled} - \text{EPR Target}$$

*Example:*
- Actual Recycled = 60 MT
- EPR Target = 56 MT
- Difference = $+4\text{ MT (Surplus)}$ $\rightarrow$ **COMPLIANT**

---

## 🏢 Five Sample Demonstration Companies

> **Academic Demo Notice:**  
> The company quantities shown below are sample/demo values for academic demonstration and are not actual company-reported figures.

| # | Company Name | Entity Type | Annual E-Waste (MT) | Actual Recycled (MT) |
|---|:---|:---|:---|:---|
| 1 | **Kaynes Technology** | Producer | 80 MT | 60 MT |
| 2 | **Sahasra Electronics** | Producer | 120 MT | 90 MT |
| 3 | **Centum Electronics** | Manufacturer | 250 MT | 190 MT |
| 4 | **Syrma SGS Technology** | Producer | 500 MT | 400 MT |
| 5 | **Tata Electronics** | Producer | 1,200 MT | 900 MT |

---

## 📁 Project Structure

```text
E-Waste-EPR-App/
│
├── app.py              # Flask server, routes, EPR calculations, validation logic
├── requirements.txt    # Flask dependency
├── README.md           # Project documentation and guide
│
├── templates/
│   └── index.html      # Responsive dashboard, forms, table, results, guide
│
└── static/
    ├── style.css       # Environmental green theme & print stylesheet
    └── script.js       # Dynamic forms, validation, and pure JS canvas chart
```

---

## ✨ Features Included

1. **Dashboard Overview Cards:** Total companies, aggregate annual e-waste, statutory EPR target for active year, and compliant entities count.
2. **Interactive EPR Calculator:** Supports manual inputs as well as 1-click loading from the 5 sample company presets.
3. **Frontend & Backend Validation:** Checks for required fields, valid entity types, and non-negative numbers.
4. **Step-by-Step Result Card:** Displays calculation formula breakdown, fee slab lookup, and recycling surplus/shortfall.
5. **Pure HTML5 Canvas Chart:** Visualizes Annual E-Waste, EPR Target, and Actual Recycled without external chart CDNs.
6. **Comparison Table:** Full 9-column responsive table with individual row loader buttons.
7. **Print Report:** Uses `window.print()` with custom `@media print` CSS rules to format clean physical or PDF reports.
8. **Calculation Guide:** Step-by-step educational breakdown of the statutory process.

---

## 🚫 Zero API / Free Offline Verification

- ❌ No API Keys required
- ❌ No `.env` configuration file needed
- ❌ No cloud database or external services
- ❌ No paid subscriptions or credit cards
- ✅ Runs 100% offline on `localhost`

---

## ⚖️ Legal Disclaimer

> *This application is an academic demonstration based on the rules and values specified in the provided college assignment. It is not a legal compliance tool and the sample company quantities are fictional/demo values.*
