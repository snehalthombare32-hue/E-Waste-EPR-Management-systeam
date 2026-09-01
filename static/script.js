/**
 * E-Waste EPR Management & Recycling Target Calculator
 * Client-Side Application Logic & Offline Charting
 * Strictly Zero External Dependencies / Zero APIs
 */

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------------
    // DOM Elements
    // ---------------------------------------------------------
    const eprForm = document.getElementById("eprForm");
    const companyNameInput = document.getElementById("companyName");
    const entityTypeSelect = document.getElementById("entityType");
    const annualWasteInput = document.getElementById("annualWaste");
    const actualRecycledInput = document.getElementById("actualRecycled");
    const financialYearSelect = document.getElementById("financialYear");
    const globalFySelect = document.getElementById("globalFySelect");
    const demoCompanySelect = document.getElementById("demoCompanySelect");
    const btnLoadSample = document.getElementById("btnLoadSample");
    const btnReset = document.getElementById("btnReset");
    const btnReloadTable = document.getElementById("btnReloadTable");
    const btnLoadAllSamples = document.getElementById("btnLoadAllSamples");

    // Result Card Elements
    const resultCard = document.getElementById("resultCard");
    const resultBody = document.getElementById("resultBody");
    const resultPlaceholder = document.getElementById("resultPlaceholder");
    const resultComplianceBadge = document.getElementById("resultComplianceBadge");
    const resCompanyName = document.getElementById("resCompanyName");
    const resEntityType = document.getElementById("resEntityType");
    const resAnnualWaste = document.getElementById("resAnnualWaste");
    const resFinancialYear = document.getElementById("resFinancialYear");
    const resTargetPct = document.getElementById("resTargetPct");
    const resEprTarget = document.getElementById("resEprTarget");
    const resActualRecycled = document.getElementById("resActualRecycled");
    const resFee = document.getElementById("resFee");
    const resFormulaApplied = document.getElementById("resFormulaApplied");
    const resDifferenceBox = document.getElementById("resDifferenceBox");
    const resDifferenceText = document.getElementById("resDifferenceText");
    const resDifferenceConclusion = document.getElementById("resDifferenceConclusion");
    const resFeeSlabNotice = document.getElementById("resFeeSlabNotice");

    // Dashboard Cards Elements
    const cardTotalCompanies = document.getElementById("cardTotalCompanies");
    const cardTotalWaste = document.getElementById("cardTotalWaste");
    const cardTotalTarget = document.getElementById("cardTotalTarget");
    const cardTargetFy = document.getElementById("cardTargetFy");
    const cardCompliantCount = document.getElementById("cardCompliantCount");
    const companyTableBody = document.getElementById("companyTableBody");

    // Canvas Chart Element
    const chartCanvas = document.getElementById("ewasteChart");

    // Current State
    let currentSummary = window.INITIAL_SUMMARY || null;

    // ---------------------------------------------------------
    // Validation Helper Functions
    // ---------------------------------------------------------
    function clearErrors() {
        document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
        document.querySelectorAll(".form-control").forEach(el => el.classList.remove("input-error"));
    }

    function setError(inputEl, errorElId, message) {
        inputEl.classList.add("input-error");
        const errSpan = document.getElementById(errorElId);
        if (errSpan) {
            errSpan.textContent = message;
        }
    }

    function validateForm() {
        clearErrors();
        let isValid = true;

        const nameVal = companyNameInput.value.trim();
        if (!nameVal) {
            setError(companyNameInput, "errCompanyName", "Company name is required.");
            isValid = false;
        }

        const typeVal = entityTypeSelect.value.trim();
        if (!typeVal) {
            setError(entityTypeSelect, "errEntityType", "Please select an entity type.");
            isValid = false;
        }

        const wasteVal = annualWasteInput.value.trim();
        if (wasteVal === "") {
            setError(annualWasteInput, "errAnnualWaste", "Annual E-Waste quantity is required.");
            isValid = false;
        } else {
            const wasteNum = parseFloat(wasteVal);
            if (isNaN(wasteNum)) {
                setError(annualWasteInput, "errAnnualWaste", "Must be a valid numerical value.");
                isValid = false;
            } else if (wasteNum < 0) {
                setError(annualWasteInput, "errAnnualWaste", "Annual E-Waste cannot be negative.");
                isValid = false;
            }
        }

        const recycledVal = actualRecycledInput.value.trim();
        if (recycledVal === "") {
            setError(actualRecycledInput, "errActualRecycled", "Actual Recycled quantity is required.");
            isValid = false;
        } else {
            const recycledNum = parseFloat(recycledVal);
            if (isNaN(recycledNum)) {
                setError(actualRecycledInput, "errActualRecycled", "Must be a valid numerical value.");
                isValid = false;
            } else if (recycledNum < 0) {
                setError(actualRecycledInput, "errActualRecycled", "Actual Recycled cannot be negative.");
                isValid = false;
            }
        }

        const fyVal = financialYearSelect.value.trim();
        if (!fyVal) {
            setError(financialYearSelect, "errFinancialYear", "Please select a financial year.");
            isValid = false;
        }

        return isValid;
    }

    // Clear error on input interaction
    [companyNameInput, entityTypeSelect, annualWasteInput, actualRecycledInput, financialYearSelect].forEach(input => {
        input.addEventListener("input", () => {
            input.classList.remove("input-error");
            const errId = "err" + input.id.charAt(0).toUpperCase() + input.id.slice(1);
            const errSpan = document.getElementById(errId);
            if (errSpan) errSpan.textContent = "";
        });
    });

    // ---------------------------------------------------------
    // Form Submission & Calculation
    // ---------------------------------------------------------
    eprForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload = {
            company_name: companyNameInput.value.trim(),
            entity_type: entityTypeSelect.value.trim(),
            annual_waste: parseFloat(annualWasteInput.value),
            actual_recycled: parseFloat(actualRecycledInput.value),
            financial_year: financialYearSelect.value.trim()
        };

        try {
            const res = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                renderCalculationResult(data);
            } else {
                alert("Validation Error: " + (data.errors ? data.errors.join("\n") : "Unable to calculate."));
            }
        } catch (err) {
            console.error("Calculation Error:", err);
            alert("Error connecting to local server.");
        }
    });

    // ---------------------------------------------------------
    // Render Calculation Result Card
    // ---------------------------------------------------------
    function renderCalculationResult(res) {
        resultPlaceholder.style.display = "none";
        resultBody.style.display = "block";

        resCompanyName.textContent = res.name;
        resEntityType.textContent = res.type;
        resAnnualWaste.textContent = `${res.annual_waste} MT`;
        resFinancialYear.textContent = res.financial_year;
        resTargetPct.textContent = `${res.target_percentage}%`;
        resEprTarget.textContent = `${res.epr_target} MT`;
        resActualRecycled.textContent = `${res.actual_recycled} MT`;
        resFee.textContent = res.registration_fee_formatted;

        // Badge Status
        if (res.is_compliant) {
            resultComplianceBadge.className = "badge badge-success";
            resultComplianceBadge.innerHTML = "🌱 COMPLIANT";
            resDifferenceBox.className = "difference-box";
        } else {
            resultComplianceBadge.className = "badge badge-danger";
            resultComplianceBadge.innerHTML = "⚠️ NON-COMPLIANT";
            resDifferenceBox.className = "difference-box non-compliant";
        }

        // Formula Breakdown
        resFormulaApplied.textContent = res.formula;

        // Difference Box
        resDifferenceText.innerHTML = `${res.actual_recycled} MT − ${res.epr_target} MT = <strong>${res.difference_str}</strong>`;
        
        if (res.is_compliant) {
            resDifferenceConclusion.innerHTML = `Since Actual Recycled (${res.actual_recycled} MT) &ge; EPR Target (${res.epr_target} MT), this entity is <strong>COMPLIANT</strong>.`;
        } else {
            resDifferenceConclusion.innerHTML = `Since Actual Recycled (${res.actual_recycled} MT) &lt; EPR Target (${res.epr_target} MT), this entity is <strong>NON-COMPLIANT</strong> by ${Math.abs(res.difference)} MT.`;
        }

        resFeeSlabNotice.innerHTML = `Applicable Fee Slab: <strong>${res.fee_slab} &rarr; ${res.registration_fee_formatted}</strong>`;

        // Highlight animation
        resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // ---------------------------------------------------------
    // Preset / Demo Company Loader
    // ---------------------------------------------------------
    function loadPresetCompany(companyData) {
        companyNameInput.value = companyData.name;
        entityTypeSelect.value = companyData.type;
        annualWasteInput.value = companyData.annual_waste;
        actualRecycledInput.value = companyData.actual_recycled;
        clearErrors();

        // Trigger instant calculation
        eprForm.dispatchEvent(new Event("submit"));
    }

    demoCompanySelect.addEventListener("change", () => {
        const selectedOption = demoCompanySelect.options[demoCompanySelect.selectedIndex];
        if (selectedOption.value) {
            loadPresetCompany({
                name: selectedOption.getAttribute("data-name"),
                type: selectedOption.getAttribute("data-type"),
                annual_waste: selectedOption.getAttribute("data-waste"),
                actual_recycled: selectedOption.getAttribute("data-recycled")
            });
        }
    });

    btnLoadSample.addEventListener("click", () => {
        if (demoCompanySelect.value) {
            demoCompanySelect.dispatchEvent(new Event("change"));
        } else {
            // Default to first company (Kaynes)
            demoCompanySelect.selectedIndex = 1;
            demoCompanySelect.dispatchEvent(new Event("change"));
        }
    });

    // ---------------------------------------------------------
    // Reset Button
    // ---------------------------------------------------------
    btnReset.addEventListener("click", () => {
        eprForm.reset();
        demoCompanySelect.value = "";
        clearErrors();
        // Restore financial year to active global FY
        financialYearSelect.value = globalFySelect.value;
    });

    // ---------------------------------------------------------
    // Table Row "Load" Buttons Event Delegation
    // ---------------------------------------------------------
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-load-row")) {
            const btn = e.target;
            loadPresetCompany({
                name: btn.getAttribute("data-name"),
                type: btn.getAttribute("data-type"),
                annual_waste: btn.getAttribute("data-waste"),
                actual_recycled: btn.getAttribute("data-recycled")
            });
            const rowFy = btn.getAttribute("data-fy");
            if (rowFy) {
                financialYearSelect.value = rowFy;
            }
        }
    });

    btnLoadAllSamples.addEventListener("click", () => {
        demoCompanySelect.selectedIndex = 1;
        demoCompanySelect.dispatchEvent(new Event("change"));
    });

    btnReloadTable.addEventListener("click", () => {
        updateDashboardAndTable(globalFySelect.value);
    });

    // ---------------------------------------------------------
    // Global Financial Year Toolbar Sync
    // ---------------------------------------------------------
    globalFySelect.addEventListener("change", (e) => {
        const selectedFy = e.target.value;
        financialYearSelect.value = selectedFy;
        updateDashboardAndTable(selectedFy);
    });

    financialYearSelect.addEventListener("change", (e) => {
        globalFySelect.value = e.target.value;
        updateDashboardAndTable(e.target.value);
    });

    async function updateDashboardAndTable(fy) {
        try {
            const res = await fetch(`/api/companies?fy=${encodeURIComponent(fy)}`);
            const data = await res.json();
            currentSummary = data;

            // Update 4 Cards
            cardTotalCompanies.textContent = data.total_companies;
            cardTotalWaste.innerHTML = `${data.total_annual_waste} <small>MT</small>`;
            cardTotalTarget.innerHTML = `${data.total_epr_target} <small>MT</small>`;
            cardTargetFy.textContent = `FY ${data.financial_year}`;
            cardCompliantCount.textContent = `${data.compliant_count} / ${data.total_companies}`;

            // Update Table
            companyTableBody.innerHTML = "";
            data.companies.forEach(comp => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${comp.id}</td>
                    <td><strong>${comp.name}</strong></td>
                    <td><span class="badge badge-neutral">${comp.type}</span></td>
                    <td>${comp.annual_waste} MT</td>
                    <td>${comp.financial_year}</td>
                    <td>${comp.target_percentage}%</td>
                    <td><strong>${comp.epr_target} MT</strong></td>
                    <td>${comp.actual_recycled} MT</td>
                    <td><code>${comp.registration_fee_formatted}</code></td>
                    <td>
                        ${comp.is_compliant ? '<span class="badge badge-success">🌱 COMPLIANT</span>' : '<span class="badge badge-danger">⚠️ NON-COMPLIANT</span>'}
                    </td>
                    <td class="no-print">
                        <button class="btn btn-xs btn-outline btn-load-row" 
                                data-name="${comp.name}" 
                                data-type="${comp.type}" 
                                data-waste="${comp.annual_waste}" 
                                data-recycled="${comp.actual_recycled}" 
                                data-fy="${comp.financial_year}">
                            Load
                        </button>
                    </td>
                `;
                companyTableBody.appendChild(tr);
            });

            // Redraw Chart with new target calculations
            drawOfflineChart(data.companies);
        } catch (err) {
            console.error("Failed to update summary:", err);
        }
    }

    // ---------------------------------------------------------
    // Pure HTML5 Canvas Grouped Bar Chart (Zero External CDN)
    // ---------------------------------------------------------
    function drawOfflineChart(companies) {
        if (!chartCanvas || !chartCanvas.getContext) return;
        const ctx = chartCanvas.getContext("2d");

        // High DPI canvas rendering
        const dpr = window.devicePixelRatio || 1;
        const rect = chartCanvas.getBoundingClientRect();
        const displayWidth = rect.width || 860;
        const displayHeight = 320;

        chartCanvas.width = displayWidth * dpr;
        chartCanvas.height = displayHeight * dpr;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        const padding = { top: 30, right: 30, bottom: 65, left: 65 };
        const chartWidth = displayWidth - padding.left - padding.right;
        const chartHeight = displayHeight - padding.top - padding.bottom;

        // Find max value for Y scale
        let maxVal = 0;
        companies.forEach(c => {
            if (c.annual_waste > maxVal) maxVal = c.annual_waste;
            if (c.actual_recycled > maxVal) maxVal = c.actual_recycled;
            if (c.epr_target > maxVal) maxVal = c.epr_target;
        });
        maxVal = Math.ceil((maxVal * 1.15) / 100) * 100 || 1400;

        // Draw Y Axis Gridlines & Labels
        const gridSteps = 5;
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.fillStyle = "#6b7280";
        ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.textAlign = "right";

        for (let i = 0; i <= gridSteps; i++) {
            const val = Math.round((maxVal / gridSteps) * i);
            const y = padding.top + chartHeight - (val / maxVal) * chartHeight;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();

            ctx.fillText(`${val} MT`, padding.left - 8, y + 4);
        }

        // Draw Groups (Companies)
        const groupCount = companies.length;
        const groupWidth = chartWidth / groupCount;
        const barWidth = Math.max(12, Math.min(22, (groupWidth - 24) / 3));

        const colors = {
            waste: "#3b82f6",    // Blue
            target: "#f59e0b",   // Amber
            recycled: "#10b981"  // Emerald
        };

        companies.forEach((comp, idx) => {
            const groupCenterX = padding.left + idx * groupWidth + groupWidth / 2;
            const startX = groupCenterX - (barWidth * 3 + 8) / 2;

            // Bar 1: Annual Waste
            const hWaste = (comp.annual_waste / maxVal) * chartHeight;
            const yWaste = padding.top + chartHeight - hWaste;
            ctx.fillStyle = colors.waste;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(startX, yWaste, barWidth, hWaste, [3, 3, 0, 0]) : ctx.rect(startX, yWaste, barWidth, hWaste);
            ctx.fill();

            // Value label
            ctx.fillStyle = "#1e3a8a";
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${comp.annual_waste}`, startX + barWidth / 2, yWaste - 4);

            // Bar 2: EPR Target
            const startX2 = startX + barWidth + 4;
            const hTarget = (comp.epr_target / maxVal) * chartHeight;
            const yTarget = padding.top + chartHeight - hTarget;
            ctx.fillStyle = colors.target;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(startX2, yTarget, barWidth, hTarget, [3, 3, 0, 0]) : ctx.rect(startX2, yTarget, barWidth, hTarget);
            ctx.fill();

            // Value label
            ctx.fillStyle = "#92400e";
            ctx.fillText(`${comp.epr_target}`, startX2 + barWidth / 2, yTarget - 4);

            // Bar 3: Actual Recycled
            const startX3 = startX2 + barWidth + 4;
            const hRecycled = (comp.actual_recycled / maxVal) * chartHeight;
            const yRecycled = padding.top + chartHeight - hRecycled;
            ctx.fillStyle = colors.recycled;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(startX3, yRecycled, barWidth, hRecycled, [3, 3, 0, 0]) : ctx.rect(startX3, yRecycled, barWidth, hRecycled);
            ctx.fill();

            // Value label
            ctx.fillStyle = "#065f46";
            ctx.fillText(`${comp.actual_recycled}`, startX3 + barWidth / 2, yRecycled - 4);

            // Company Name on X-Axis
            ctx.fillStyle = "#1f2937";
            ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.textAlign = "center";
            
            // Abbreviate long names for mobile if needed
            let shortName = comp.name;
            if (displayWidth < 600) {
                shortName = comp.name.split(" ")[0];
            }
            ctx.fillText(shortName, groupCenterX, padding.top + chartHeight + 20);

            // Subtitle type
            ctx.fillStyle = "#6b7280";
            ctx.font = "10px sans-serif";
            ctx.fillText(`(${comp.type})`, groupCenterX, padding.top + chartHeight + 35);
        });

        // Draw Baseline Axis
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top + chartHeight);
        ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
        ctx.stroke();
    }

    // Redraw chart on window resize
    window.addEventListener("resize", () => {
        if (currentSummary && currentSummary.companies) {
            drawOfflineChart(currentSummary.companies);
        }
    });

    // Initial Chart Render
    if (currentSummary && currentSummary.companies) {
        drawOfflineChart(currentSummary.companies);
    }
});
