// static/js/1040.js
document.addEventListener('DOMContentLoaded', function () {
    // --- Configuration based on reverse-engineered logic ---
    const TAX_BRACKETS_2025 = {
        single: [
            { rate: 0.10, min: 0, max: 11600 },
            { rate: 0.12, min: 11601, max: 47150 },
            { rate: 0.22, min: 47151, max: 100525 },
            { rate: 0.24, min: 100526, max: 191950 },
            { rate: 0.32, min: 191951, max: 243725 },
            { rate: 0.35, min: 243726, max: 609350 },
            { rate: 0.37, min: 609351, max: Infinity }
        ],
        married_jointly: [
            { rate: 0.10, min: 0, max: 23200 },
            { rate: 0.12, min: 23201, max: 94300 },
            { rate: 0.22, min: 94301, max: 201050 },
            { rate: 0.24, min: 201051, max: 383900 },
            { rate: 0.32, min: 383901, max: 487450 },
            { rate: 0.35, min: 487451, max: 731200 },
            { rate: 0.37, min: 731201, max: Infinity }
        ],
        // ... Add other statuses (married_separately, head_of_household) if needed
    };

    const CAPITAL_GAINS_BRACKETS_2025 = {
        single: [ { rate: 0.00, max: 48350 }, { rate: 0.15, max: 533400 }, { rate: 0.20, max: Infinity } ],
        married_jointly: [ { rate: 0.00, max: 96700 }, { rate: 0.15, max: 600050 }, { rate: 0.20, max: Infinity } ],
    };

    const STANDARD_DEDUCTIONS_2025 = {
        single: 14600,
        married_jointly: 29200,
        married_separately: 14600,
        head_of_household: 21900,
        surviving_spouse: 29200,
    };

    const CHILD_TAX_CREDIT_AMOUNT = 2000;
    const SE_TAX_RATE_FICA = 0.124; // Social Security portion
    const SE_TAX_RATE_MEDICARE = 0.029; // Medicare portion
    const SE_INCOME_DEDUCTION_MULTIPLIER = 0.9235;

    // --- Element Selectors ---
    const calculateBtn = document.getElementById('calculate-btn');
    const deductionTypeSelect = document.getElementById('deduction-type');
    const itemizedGroup = document.getElementById('itemized-deduction-group');

    // --- Event Listeners ---
    deductionTypeSelect.addEventListener('change', () => {
        itemizedGroup.classList.toggle('hidden', deductionTypeSelect.value !== 'itemized');
    });

    calculateBtn.addEventListener('click', calculateTaxes);

    // --- Main Calculation Function ---
    function calculateTaxes() {
        // 1. Get all input values
        const filingStatus = document.getElementById('filing-status').value;
        const wages = parseFloat(document.getElementById('wages').value) || 0;
        const dependents = parseInt(document.getElementById('dependents').value) || 0;
        const capitalGain = parseFloat(document.getElementById('capital-gain').value) || 0;
        const businessIncome = parseFloat(document.getElementById('business-income').value) || 0;
        const educatorExpenses = parseFloat(document.getElementById('educator-expenses').value) || 0;

        // 2. Calculate Self-Employment Tax
        const netSEIncome = businessIncome * SE_INCOME_DEDUCTION_MULTIPLIER;
        const seTaxFICA = netSEIncome * SE_TAX_RATE_FICA;
        const seTaxMedicare = netSEIncome * SE_TAX_RATE_MEDICARE;
        const selfEmploymentTax = seTaxFICA + seTaxMedicare;

        // 3. Calculate AGI
        const agi = wages + capitalGain + businessIncome - educatorExpenses;

        // 4. Determine Deduction
        let totalDeduction = 0;
        if (deductionTypeSelect.value === 'standard') {
            totalDeduction = STANDARD_DEDUCTIONS_2025[filingStatus];
        } else {
            totalDeduction = parseFloat(document.getElementById('itemized-deduction').value) || 0;
        }

        // 5. Calculate Taxable Income
        const taxableIncome = Math.max(0, agi - totalDeduction);

        // 6. Calculate Income Tax
        const incomeTax = calculateBracketTax(taxableIncome, TAX_BRACKETS_2025[filingStatus]);

        // 7. Calculate Capital Gains Tax
        const capitalGainsTax = calculateBracketTax(capitalGain, CAPITAL_GAINS_BRACKETS_2025[filingStatus]);

        // 8. Calculate Child Tax Credit
        const childTaxCredit = dependents * CHILD_TAX_CREDIT_AMOUNT;

        // 9. Calculate Total Tax
        const totalTax = incomeTax + capitalGainsTax + selfEmploymentTax - childTaxCredit;

        // 10. Display Results
        displayResults({
            agi,
            totalDeduction,
            taxableIncome,
            selfEmploymentTax,
            childTaxCredit,
            totalTax
        });
    }

    function calculateBracketTax(income, brackets) {
        let tax = 0;
        for (const bracket of brackets) {
            if (income > bracket.min) {
                const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
                tax += taxableInBracket * bracket.rate;
            }
        }
        return tax;
    }

    function displayResults(results) {
        document.getElementById('result-agi').textContent = formatCurrency(results.agi);
        document.getElementById('result-deductions').textContent = formatCurrency(results.totalDeduction);
        document.getElementById('result-taxable-income').textContent = formatCurrency(results.taxableIncome);
        document.getElementById('result-se-tax').textContent = formatCurrency(results.selfEmploymentTax);
        document.getElementById('result-child-credit').textContent = formatCurrency(results.childTaxCredit);
        document.getElementById('result-total-tax').innerHTML = `<strong>${formatCurrency(results.totalTax)}</strong>`;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
});