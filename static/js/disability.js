// static/js/disability.js
// This script handles the dynamic display, editing, and calculation of
// VA Disability Pay data, along with yearly and running totals.

let monthlyAmountsData = []; // Will be populated from the database
let yearCollapseState = {}; // Object to keep track of the collapse state for each year

/**
 * Formats a number as currency (USD).
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string.
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Displays a non-blocking message to the user.
 * (Requires a corresponding HTML element, e.g., <div id="message-box"></div>, and CSS for styling)
 * @param {string} message - The message to display.
 * @param {string} type - The type of message (e.g., 'success', 'error', 'info').
 */
function showMessage(message, type = 'info') {
    const msgBox = document.getElementById('message-box');
    if (msgBox) {
        msgBox.textContent = message;
        // Add/remove classes for styling (e.g., 'message-box-success', 'message-box-error')
        msgBox.className = `message-box message-box-${type}`;
        msgBox.style.display = 'block';
        setTimeout(() => {
            msgBox.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    } else {
        console.log(`[${type.toUpperCase()}]: ${message}`); // Fallback to console
    }
}

/**
 * Handles changes in monthly input fields (Gross Pay or Taxed Amount).
 * Updates local data, recalculates net pay, updates displayed net pay,
 * and sends changes to the backend API.
 * @param {HTMLInputElement} inputElement - The input field that changed.
 * @param {number} id - The database ID of the monthly entry.
 * @param {number} year - The year of the entry.
 * @param {string} amountType - 'gross_pay' or 'taxed_amount', indicating which field changed.
 */
async function handleAmountChange(inputElement, id, year, amountType) {
    const newValue = parseFloat(inputElement.value);
    const monthEntry = monthlyAmountsData.find(m => m.id === id);

    if (isNaN(newValue) || newValue < 0) { // Added non-negative check
        showMessage("Invalid input. Please enter a non-negative number.", "error");
        // Revert input to previous valid value
        if (monthEntry) {
            inputElement.value = monthEntry[amountType].toFixed(2);
        }
        return;
    }

    if (!monthEntry) {
        console.error("Could not find month entry for ID:", id);
        showMessage("Error: Entry not found locally.", "error");
        return;
    }

    // Update the local data immediately
    monthEntry[amountType] = newValue;
    // Recalculate net_pay based on the updated gross_pay and taxed_amount
    monthEntry.net_pay = monthEntry.gross_pay - monthEntry.taxed_amount;

    // Update the displayed Net Pay for the current row
    const netPayCell = document.getElementById(`VA_Disability_Monthly_Net_Income_${monthEntry.month_name.substring(0, 3)}_${monthEntry.year}`);
    if (netPayCell) {
        netPayCell.textContent = formatCurrency(monthEntry.net_pay);
    }

    // --- Send update to the backend API ---
    try {
        const response = await fetch('/personal/api/va_disability/update', { // UPDATED API ENDPOINT
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                grossPay: monthEntry.gross_pay,
                taxedAmount: monthEntry.taxed_amount // Send both gross and taxed amounts
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        showMessage(result.message, "success"); // Use custom message system

        // Re-render only the totals sections after successful update
        updateRunningTotals();
        updateYearlyTotals(year);

    } catch (error) {
        console.error("Failed to save data:", error);
        showMessage("Failed to save data. Please check the console for details.", "error");
        // Revert the input value if save failed
        if (monthEntry) {
            inputElement.value = monthEntry[amountType].toFixed(2);
        }
        // Consider re-fetching all data to ensure consistency with backend
        // initializeApp(); // Uncomment if a full re-render is preferred on error
    }
}

/**
 * Toggles the visibility of a year's months and its total row in the table.
 * @param {number} year - The year whose visibility to toggle.
 */
function toggleYearVisibility(year) {
    const yearHeaderRow = document.getElementById(`year-header-${year}`);
    if (!yearHeaderRow) return;

    const isHidden = yearHeaderRow.classList.toggle('collapsed'); // Toggle collapsed class on the header row
    yearCollapseState[year] = isHidden; // Update state

    // Find all rows belonging to this year's data (excluding the header and total row for now)
    // We'll give each month row and the total row a data-year attribute
    const rowsToToggle = document.querySelectorAll(`#disability-main-table-body tr[data-year-data="${year}"]`); // UPDATED ID

    rowsToToggle.forEach(row => {
        row.classList.toggle('hidden', isHidden); // Toggle hidden class based on header's collapsed state
    });

    // Toggle Font Awesome icon on the year header row
    const toggleIcon = yearHeaderRow.querySelector('.toggle-icon');
    if (toggleIcon) {
        if (isHidden) {
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-right'); // Right arrow for collapsed
        } else {
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-down'); // Down arrow for open
        }
    }
}

/**
 * Updates only the running totals in the header section for the current calendar year.
 * All data is now included in totals, as hiding is removed.
 */
function updateRunningTotals() {
    const today = new Date();
    const currentYear = today.getFullYear();

    let overallCurrentCalendarYearGrossTotal = 0;
    let overallCurrentCalendarYearNetTotal = 0;
    let overallCurrentCalendarYearTaxedTotal = 0;

    monthlyAmountsData.forEach(data => {
        if (data.year === currentYear) {
            // Sum all data for the current year, as hiding is removed
            overallCurrentCalendarYearGrossTotal += data.gross_pay;
            overallCurrentCalendarYearTaxedTotal += data.taxed_amount;
            overallCurrentCalendarYearNetTotal += data.net_pay;
        }
    });

    document.getElementById('running-disability-gross-total').textContent = formatCurrency(overallCurrentCalendarYearGrossTotal); // UPDATED ID
    document.getElementById('running-disability-taxed-total').textContent = formatCurrency(overallCurrentCalendarYearTaxedTotal); // UPDATED ID
    document.getElementById('running-disability-net-total').textContent = formatCurrency(overallCurrentCalendarYearNetTotal); // UPDATED ID
}

/**
 * Updates yearly totals for a specific year in the table.
 * All data is now included in totals, as hiding is removed.
 * @param {number} year - The year for which to update totals.
 */
function updateYearlyTotals(year) {
    const yearData = monthlyAmountsData.filter(item => item.year === parseInt(year));
    let yearGrossTotal = 0;
    let yearTaxedTotal = 0;
    let yearNetTotal = 0;

    yearData.forEach(data => {
        // Sum all data for the year, as hiding is removed
        yearGrossTotal += data.gross_pay;
        yearTaxedTotal += data.taxed_amount;
        yearNetTotal += data.net_pay;
    });

    // Update the specific year's total row
    const yearTotalGrossCell = document.getElementById(`VA_Disability_Yearly_Gross_Income_${year}`); // UPDATED ID
    const yearTotalTaxedCell = document.getElementById(`VA_Disability_Yearly_Taxed_Amount_${year}`); // UPDATED ID
    const yearTotalNetCell = document.getElementById(`VA_Disability_Yearly_Net_Income_${year}`); // UPDATED ID

    if (yearTotalGrossCell) yearTotalGrossCell.textContent = formatCurrency(yearGrossTotal);
    if (yearTotalTaxedCell) yearTotalTaxedCell.textContent = formatCurrency(yearTaxedTotal);
    if (yearTotalNetCell) yearTotalNetCell.textContent = formatCurrency(yearNetTotal);
}

/**
 * Updates the monthly data table and all totals (re-renders the entire table).
 * All data is now displayed and editable.
 */
function updateMonthlyData() {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Display the current date
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-calendar-year').textContent = currentYear; // UPDATED ID

    const mainTableBody = document.getElementById('disability-main-table-body'); // UPDATED ID
    mainTableBody.innerHTML = ''; // Clear existing rows

    // Group data by year
    const dataByYear = monthlyAmountsData.reduce((acc, item) => {
        if (!acc[item.year]) {
            acc[item.year] = [];
        }
        acc[item.year].push(item);
        return acc;
    }, {});

    // Sort years to ensure they are displayed in ascending order
    const sortedYears = Object.keys(dataByYear).sort((a, b) => parseInt(a) - parseInt(b));

    for (const year of sortedYears) {
        const yearData = dataByYear[year];

        // Create year header row (tr)
        const yearHeaderRow = document.createElement('tr');
        yearHeaderRow.id = `year-header-${year}`;
        yearHeaderRow.className = 'year-header-row'; // Class for the <tr>
        yearHeaderRow.setAttribute('data-year', year); // Custom attribute for easy lookup
        // The td inside will have year-header-cell class
        yearHeaderRow.innerHTML = `<td colspan="4" class="year-header-cell">
                                        <div class="year-header-content">
                                            <i class="fas fa-chevron-down toggle-icon"></i> <!-- Font Awesome icon -->
                                            ${year}
                                        </div>
                                    </td>`;
        mainTableBody.appendChild(yearHeaderRow); // Append to the main tbody

        // Set initial collapse state: current year is expanded, others are collapsed
        const isYearCollapsed = (parseInt(year) !== currentYear);
        yearCollapseState[year] = isYearCollapsed; // Update state

        // Add click listener to the year header
        yearHeaderRow.addEventListener('click', () => toggleYearVisibility(year));

        yearData.forEach((data) => {
            const row = document.createElement('tr');
            row.setAttribute('data-year-data', year); // Mark this row as belonging to this year for toggling
            if (isYearCollapsed) {
                row.classList.add('hidden'); // Initially hide if the year is collapsed
            }

            // Month Cell
            const monthCell = document.createElement('td');
            monthCell.textContent = data.month_name; // Use month_name from API
            row.appendChild(monthCell);

            // Gross Pay Cell (editable input)
            const grossPayCell = document.createElement('td');
            const grossPayInput = document.createElement('input');
            grossPayInput.type = 'number';
            grossPayInput.value = data.gross_pay.toFixed(2); // Use gross_pay from API
            grossPayInput.onchange = () => handleAmountChange(grossPayInput, data.id, data.year, 'gross_pay'); // Pass data.id
            grossPayInput.disabled = false; // Always enabled
            grossPayInput.classList.remove('hidden-amount'); // Ensure no hidden-amount class
            grossPayInput.id = `VA_Disability_Monthly_Gross_Income_${data.month_name.substring(0, 3)}_${data.year}`; // UPDATED ID
            grossPayCell.appendChild(grossPayInput);
            row.appendChild(grossPayCell);

            // Taxed Amount Cell (editable input)
            const taxedAmountCell = document.createElement('td');
            const taxedAmountInput = document.createElement('input');
            taxedAmountInput.type = 'number';
            taxedAmountInput.value = data.taxed_amount.toFixed(2); // Use taxed_amount from API
            taxedAmountInput.onchange = () => handleAmountChange(taxedAmountInput, data.id, data.year, 'taxed_amount'); // Pass data.id
            taxedAmountInput.disabled = false; // Always enabled
            taxedAmountInput.classList.remove('hidden-amount'); // Ensure no hidden-amount class
            taxedAmountInput.id = `VA_Disability_Monthly_Taxed_Amount_${data.month_name.substring(0, 3)}_${data.year}`; // UPDATED ID
            taxedAmountCell.appendChild(taxedAmountInput);
            row.appendChild(taxedAmountCell);

            // Net Pay Cell
            const netPayCell = document.createElement('td');
            netPayCell.textContent = formatCurrency(data.net_pay); // Always display net_pay
            netPayCell.classList.remove('hidden-amount'); // Ensure no hidden-amount class
            netPayCell.id = `VA_Disability_Monthly_Net_Income_${data.month_name.substring(0, 3)}_${data.year}`; // UPDATED ID
            row.appendChild(netPayCell);

            // Append the month row to the main tbody
            mainTableBody.appendChild(row);
        });

        // Add the year total row after all months for the current year have been added
        const yearTotalRow = document.createElement('tr');
        yearTotalRow.className = 'total-row';
        yearTotalRow.id = `VA_Disability_Yearly_Total_Row_${year}`; // UPDATED ID
        yearTotalRow.setAttribute('data-year-data', year); // Mark this row for toggling
        if (isYearCollapsed) {
            yearTotalRow.classList.add('hidden'); // Initially hide if the year is collapsed
        }
        yearTotalRow.innerHTML = `
            <td class="rounded-bl-lg">Year Total</td>
            <td id="VA_Disability_Yearly_Gross_Income_${year}">${formatCurrency(0)}</td> <!-- UPDATED ID -->
            <td id="VA_Disability_Yearly_Taxed_Amount_${year}">${formatCurrency(0)}</td> <!-- UPDATED ID -->
            <td id="VA_Disability_Yearly_Net_Income_${year}" class="rounded-br-lg">${formatCurrency(0)}</td> <!-- UPDATED ID -->
        `;
        mainTableBody.appendChild(yearTotalRow); // Append to the main tbody
        updateYearlyTotals(year); // Calculate and display totals for this year
    }

    // Update the running total displays for the current calendar year in the top section
    updateRunningTotals();

    // After rendering, apply initial icon state for year headers
    sortedYears.forEach(year => {
        const yearHeaderRow = document.getElementById(`year-header-${year}`);
        if (yearHeaderRow && yearCollapseState[year]) { // If it's supposed to be collapsed
            const toggleIcon = yearHeaderRow.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-right');
            }
        }
    });
}

/**
 * Exports all monthly data to a JSON format and displays it in a textarea.
 */
function exportData() {
    const exportedJson = JSON.stringify(monthlyAmountsData, null, 2); // Pretty print JSON
    const textarea = document.getElementById('exported-data-textarea'); // UPDATED ID
    textarea.value = exportedJson;
    document.getElementById('export-output-area').classList.remove('hidden'); // UPDATED ID
    showMessage("Data exported to JSON area.", "info");
}

/**
 * Copies text from a specified element to the clipboard.
 * @param {string} elementId - The ID of the textarea element to copy from.
 */
function copyToClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy'); // Use execCommand for broader compatibility in iframes
    
    const copyMessage = document.getElementById('copy-message'); // UPDATED ID
    copyMessage.classList.remove('hidden');
    setTimeout(() => {
        copyMessage.classList.add('hidden');
    }, 2000); // Hide message after 2 seconds
    showMessage("Copied to clipboard!", "success");
}


/**
 * Initializes the application by fetching data from the backend.
 */
async function initializeApp() {
    try {
        // Fetch data from Flask API endpoint for VA Disability
        const response = await fetch('/personal/api/va_disability/data'); // UPDATED API ENDPOINT
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        monthlyAmountsData = data; // Populate global variable with fetched data

        // Ensure data types are correct for calculations and sorting
        monthlyAmountsData.forEach(item => {
            item.month_index = parseInt(item.month_index);
            item.year = parseInt(item.year);
            item.gross_pay = parseFloat(item.gross_pay);
            item.taxed_amount = parseFloat(item.taxed_amount);
            item.net_pay = parseFloat(item.net_pay);
        });

        // Re-render the table with the fetched data
        updateMonthlyData();

    } catch (error) {
        console.error("Error fetching initial data:", error);
        showMessage("Failed to load initial data. Please check the console and server.", "error");
    }

    // Attach event listeners after initial render
    document.getElementById('export-button').addEventListener('click', exportData); // UPDATED ID
    document.getElementById('copy-export-button').addEventListener('click', () => copyToClipboard('exported-data-textarea')); // UPDATED ID
}

// Run the initialization function when the page loads
window.onload = initializeApp;
