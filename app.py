"""
E-Waste EPR Management & Recycling Target Calculator
Based on India's E-Waste (Management) Rules, 2022
Academic Mini-Project for Third-Year Computer Engineering
Strictly Zero External APIs / 100% Offline & Free
"""

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ---------------------------------------------------------
# CONSTANTS & RULES (Source: E-Waste Management Rules 2022)
# ---------------------------------------------------------

# Target Percentages by Financial Year
EPR_RATES = {
    "2023-24": 60,
    "2024-25": 60,
    "2025-26": 70,
    "2026-27": 70,
    "2027-28": 80,
    "2028-29": 80,
    "2027-28 onward": 80,
}

ALLOWED_ENTITY_TYPES = ["Manufacturer", "Producer", "Recycler", "Refurbisher"]

# Five Sample Demo Companies (Academic values only)
SAMPLE_COMPANIES = [
    {
        "id": 1,
        "name": "Kaynes Technology",
        "type": "Producer",
        "annual_waste": 80.0,
        "actual_recycled": 60.0,
    },
    {
        "id": 2,
        "name": "Sahasra Electronics",
        "type": "Producer",
        "annual_waste": 120.0,
        "actual_recycled": 90.0,
    },
    {
        "id": 3,
        "name": "Centum Electronics",
        "type": "Manufacturer",
        "annual_waste": 250.0,
        "actual_recycled": 190.0,
    },
    {
        "id": 4,
        "name": "Syrma SGS Technology",
        "type": "Producer",
        "annual_waste": 500.0,
        "actual_recycled": 400.0,
    },
    {
        "id": 5,
        "name": "Tata Electronics",
        "type": "Producer",
        "annual_waste": 1200.0,
        "actual_recycled": 900.0,
    },
]

# ---------------------------------------------------------
# CORE CALCULATION FUNCTIONS
# ---------------------------------------------------------

def get_target_percentage(financial_year: str) -> int:
    """Return the EPR target percentage for a given financial year."""
    fy = financial_year.strip()
    if fy in EPR_RATES:
        return EPR_RATES[fy]
    # Default to 80% if year is 2027-28 onward or unknown future year
    return 80


def calculate_epr_target(annual_waste: float, financial_year: str) -> tuple[float, int, str]:
    """
    Calculate the EPR target in MT.
    Formula: EPR Target (MT) = Annual E-Waste Generated × Target Percentage / 100
    """
    target_pct = get_target_percentage(financial_year)
    epr_target = round((annual_waste * target_pct) / 100.0, 2)
    formula_str = f"{annual_waste:g} MT × {target_pct}% = {epr_target:g} MT"
    return epr_target, target_pct, formula_str


def calculate_registration_fee(epr_target: float) -> tuple[int, str, str]:
    """
    Determine the registration fee based on the EPR target slab.
    Slabs:
      - Target < 50 MT          -> ₹2,500
      - 50 <= Target < 100 MT   -> ₹7,500
      - 100 <= Target < 1000 MT -> ₹1,50,000
      - 1000 <= Target < 5000 MT-> ₹10,00,000
      - Target >= 5000 MT       -> ₹15,00,000
    """
    if epr_target < 50:
        fee = 2500
        slab_desc = "Target < 50 MT"
    elif 50 <= epr_target < 100:
        fee = 7500
        slab_desc = "50 MT to < 100 MT"
    elif 100 <= epr_target < 1000:
        fee = 150000
        slab_desc = "100 MT to < 1,000 MT"
    elif 1000 <= epr_target < 5000:
        fee = 1000000
        slab_desc = "1,000 MT to < 5,000 MT"
    else:
        fee = 1500000
        slab_desc = "Target >= 5,000 MT"

    # Format in Indian numbering system style (₹2,500 / ₹1,50,000 / ₹10,00,000)
    formatted_fee = format_inr(fee)
    return fee, formatted_fee, slab_desc


def format_inr(number: int) -> str:
    """Format integer to Indian Rupee representation (e.g., 150000 -> ₹1,50,000)."""
    s = str(number)
    if len(s) <= 3:
        return f"₹{s}"
    last_three = s[-3:]
    remaining = s[:-3]
    # Group remaining digits by 2
    groups = []
    while len(remaining) > 2:
        groups.insert(0, remaining[-2:])
        remaining = remaining[:-2]
    if remaining:
        groups.insert(0, remaining)
    return f"₹{','.join(groups)},{last_three}"


def evaluate_compliance(actual_recycled: float, epr_target: float) -> tuple[str, bool, float, str]:
    """
    Evaluate compliance status:
      Actual Recycled >= EPR Target -> COMPLIANT
      Actual Recycled < EPR Target  -> NON-COMPLIANT
    """
    diff = round(actual_recycled - epr_target, 2)
    is_compliant = actual_recycled >= epr_target
    status = "COMPLIANT" if is_compliant else "NON-COMPLIANT"
    
    if diff > 0:
        diff_str = f"+{diff:g} MT (Surplus)"
    elif diff < 0:
        diff_str = f"{diff:g} MT (Shortfall)"
    else:
        diff_str = "0 MT (Exact Target Met)"

    return status, is_compliant, diff, diff_str


def process_company_data(company: dict, financial_year: str = "2024-25") -> dict:
    """Compute all EPR figures for a company dictionary."""
    annual_waste = float(company["annual_waste"])
    actual_recycled = float(company["actual_recycled"])

    epr_target, target_pct, formula_str = calculate_epr_target(annual_waste, financial_year)
    fee_val, fee_formatted, slab_desc = calculate_registration_fee(epr_target)
    status, is_compliant, diff, diff_str = evaluate_compliance(actual_recycled, epr_target)

    return {
        "id": company.get("id"),
        "name": company["name"],
        "type": company["type"],
        "annual_waste": annual_waste,
        "financial_year": financial_year,
        "target_percentage": target_pct,
        "epr_target": epr_target,
        "actual_recycled": actual_recycled,
        "registration_fee": fee_val,
        "registration_fee_formatted": fee_formatted,
        "fee_slab": slab_desc,
        "compliance_status": status,
        "is_compliant": is_compliant,
        "difference": diff,
        "difference_str": diff_str,
        "formula": formula_str,
    }


def get_dashboard_summary(financial_year: str = "2024-25") -> dict:
    """Calculate aggregate summary stats across the 5 sample companies."""
    processed = [process_company_data(c, financial_year) for c in SAMPLE_COMPANIES]
    total_companies = len(processed)
    total_annual_waste = round(sum(c["annual_waste"] for c in processed), 2)
    total_epr_target = round(sum(c["epr_target"] for c in processed), 2)
    compliant_count = sum(1 for c in processed if c["is_compliant"])
    non_compliant_count = total_companies - compliant_count
    total_actual_recycled = round(sum(c["actual_recycled"] for c in processed), 2)

    return {
        "financial_year": financial_year,
        "total_companies": total_companies,
        "total_annual_waste": total_annual_waste,
        "total_epr_target": total_epr_target,
        "compliant_count": compliant_count,
        "non_compliant_count": non_compliant_count,
        "total_actual_recycled": total_actual_recycled,
        "companies": processed,
    }


# ---------------------------------------------------------
# FLASK ROUTES
# ---------------------------------------------------------

@app.route("/")
def index():
    """Main dashboard page."""
    default_fy = "2024-25"
    summary = get_dashboard_summary(default_fy)
    return render_template(
        "index.html",
        summary=summary,
        financial_years=list(EPR_RATES.keys()),
        entity_types=ALLOWED_ENTITY_TYPES,
        sample_companies=SAMPLE_COMPANIES,
        default_fy=default_fy,
    )


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    """API endpoint to calculate EPR, fee, and compliance with validation."""
    data = request.get_json() or request.form

    # Backend Validation
    errors = []

    company_name = data.get("company_name", "").strip()
    if not company_name:
        errors.append("Company name is required.")

    entity_type = data.get("entity_type", "").strip()
    if not entity_type or entity_type not in ALLOWED_ENTITY_TYPES:
        errors.append(f"Invalid Entity Type. Must be one of: {', '.join(ALLOWED_ENTITY_TYPES)}")

    financial_year = data.get("financial_year", "").strip()
    if not financial_year or financial_year not in EPR_RATES:
        errors.append("Please select a valid Financial Year.")

    # Numerical validations
    try:
        annual_waste_raw = data.get("annual_waste")
        if annual_waste_raw is None or str(annual_waste_raw).strip() == "":
            errors.append("Annual E-Waste quantity is required.")
        else:
            annual_waste = float(annual_waste_raw)
            if annual_waste < 0:
                errors.append("Annual E-Waste cannot be negative.")
    except (ValueError, TypeError):
        errors.append("Annual E-Waste must be a valid number.")
        annual_waste = 0.0

    try:
        actual_recycled_raw = data.get("actual_recycled")
        if actual_recycled_raw is None or str(actual_recycled_raw).strip() == "":
            errors.append("Actual E-Waste Recycled quantity is required.")
        else:
            actual_recycled = float(actual_recycled_raw)
            if actual_recycled < 0:
                errors.append("Actual Recycled quantity cannot be negative.")
    except (ValueError, TypeError):
        errors.append("Actual Recycled must be a valid number.")
        actual_recycled = 0.0

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    # Calculate
    company_obj = {
        "name": company_name,
        "type": entity_type,
        "annual_waste": annual_waste,
        "actual_recycled": actual_recycled,
    }
    result = process_company_data(company_obj, financial_year)
    result["success"] = True

    return jsonify(result)


@app.route("/api/companies", methods=["GET"])
def api_companies():
    """Return all sample companies computed for a requested financial year."""
    fy = request.args.get("fy", "2024-25").strip()
    if fy not in EPR_RATES:
        fy = "2024-25"
    summary = get_dashboard_summary(fy)
    return jsonify(summary)


@app.route("/api/sample-data", methods=["GET"])
def api_sample_data():
    """Return the raw sample companies list for autofilling forms."""
    return jsonify({"companies": SAMPLE_COMPANIES})


if __name__ == "__main__":
    # Runs locally on standard port 5000
    print("=================================================================")
    print("🌱 E-Waste EPR Management & Recycling Target Calculator")
    print("📌 Academic Demo App | Computer Engineering Mini-Project")
    print("🚫 Zero External APIs | 100% Free & Local")
    print("🚀 Running on: http://127.0.0.1:5000")
    print("=================================================================")
    app.run(debug=True, host="127.0.0.1", port=5000)
