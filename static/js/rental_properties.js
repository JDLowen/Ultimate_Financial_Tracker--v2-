// static/js/rental_properties.js
// This script handles the dynamic display, input, and management of rental properties.

let rentalPropertiesData = []; // Stores the current list of properties
let currentEditPropertyId = null; // Stores the ID of the property being edited (database ID)

// Get references to form elements
const form = document.getElementById('add-property-form');
const submitButton = document.getElementById('submit-property-button');
const cancelButton = document.getElementById('cancel-edit-button');
const formSectionTitle = document.getElementById('form-section-title');
const propertyIdInput = document.getElementById('property-id');
const propertyDbIdInput = document.getElementById('property-db-id'); // Hidden field for DB ID

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
 * @param {string} message - The message to display.
 * @param {string} type - The type of message (e.g., 'success', 'error', 'info').
 */
function showMessage(message, type = 'info') {
    const msgBox = document.getElementById('message-box');
    if (msgBox) {
        msgBox.textContent = message;
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
 * Displays a confirmation dialog using a custom message box.
 * @param {string} message - The message to display in the confirmation.
 * @returns {Promise<boolean>} A promise that resolves to true if confirmed, false otherwise.
 */
function showConfirm(message) {
    return new Promise((resolve) => {
        const confirmBox = document.createElement('div');
        confirmBox.className = 'message-box message-box-info';
        confirmBox.style.display = 'block';
        confirmBox.style.position = 'fixed';
        confirmBox.style.top = '50%';
        confirmBox.style.left = '50%';
        confirmBox.style.transform = 'translate(-50%, -50%)';
        confirmBox.style.zIndex = '1000';
        confirmBox.style.padding = '20px';
        confirmBox.style.backgroundColor = '#fff';
        confirmBox.style.border = '1px solid #ccc';
        confirmBox.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        confirmBox.style.textAlign = 'center';
        confirmBox.style.minWidth = '300px';

        confirmBox.innerHTML = `
            <p>${message}</p>
            <button id="confirm-yes" class="btn btn-save" style="margin-right: 10px;">Yes</button>
            <button id="confirm-no" class="btn btn-delete">No</button>
        `;
        document.body.appendChild(confirmBox);

        document.getElementById('confirm-yes').onclick = () => {
            document.body.removeChild(confirmBox);
            resolve(true);
        };
        document.getElementById('confirm-no').onclick = () => {
            document.body.removeChild(confirmBox);
            resolve(false);
        };
    });
}


/**
 * Renders the list of properties in the table.
 * @param {Array} properties - The array of property objects to render.
 */
function renderProperties(properties) {
    const tableBody = document.getElementById('property-list-body');
    tableBody.innerHTML = ''; // Clear existing rows

    if (properties.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No properties added yet.</td></tr>';
        return;
    }

    properties.forEach(property => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${property.property_id}</td>
            <td>${property.property_name}</td>
            <td>${property.ownership_association}</td>
            <td>${formatCurrency(property.purchase_price)}</td>
            <td><button class="btn btn-view-docs" data-property-id="${property.id}">View Docs</button></td>
            <td>
                <button class="btn btn-edit" data-property-id="${property.id}">Edit</button>
                <button class="btn btn-delete" data-property-id="${property.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Attach event listeners for dynamically created buttons
    document.querySelectorAll('.btn-view-docs').forEach(button => {
        button.addEventListener('click', (event) => viewDocuments(event.target.dataset.propertyId));
    });
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (event) => editProperty(event.target.dataset.propertyId));
    });
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (event) => deleteProperty(event.target.dataset.propertyId));
    });
}

/**
 * Handles sorting the properties list.
 */
function sortProperties() {
    const sortBy = document.getElementById('sort-by').value;
    const sortedData = [...rentalPropertiesData].sort((a, b) => {
        // Handle date sorting specifically
        if (sortBy === 'purchase_date') {
            const dateA = new Date(a[sortBy]);
            const dateB = new Date(b[sortBy]);
            return dateA - dateB;
        }
        // Handle string comparison for other fields
        if (typeof a[sortBy] === 'string') {
            return a[sortBy].localeCompare(b[sortBy]);
        }
        // Default to numeric comparison
        return a[sortBy] - b[sortBy];
    });
    renderProperties(sortedData);
}

/**
 * Populates the form with data of the property to be edited.
 * @param {number} id - The database ID of the property to edit.
 */
function editProperty(id) {
    const property = rentalPropertiesData.find(p => p.id == id); // Use == for loose comparison if ID types differ
    if (!property) {
        showMessage("Property not found for editing.", "error");
        return;
    }

    // Set hidden ID field
    propertyDbIdInput.value = property.id;
    currentEditPropertyId = property.id; // Store current edit ID

    // Populate form fields
    propertyIdInput.value = property.property_id;
    document.getElementById('property-name').value = property.property_name;
    document.getElementById('address').value = property.address;
    document.getElementById('city').value = property.city;
    document.getElementById('state').value = property.state;
    document.getElementById('county').value = property.county || ''; // Handle null/undefined
    document.getElementById('built-year').value = property.built_year;
    document.getElementById('purchase-date').value = property.purchase_date; // Date string is fine for input[type="date"]
    document.getElementById('ownership-association').value = property.ownership_association;
    document.getElementById('purchase-price').value = property.purchase_price;
    document.getElementById('down-payment').value = property.down_payment;
    document.getElementById('interest-rate').value = property.interest_rate;
    document.getElementById('mortgage-broker-name').value = property.mortgage_broker_name || '';
    document.getElementById('maturity-date').value = property.maturity_date || ''; // New field
    document.getElementById('loan-number').value = property.loan_number || ''; // New field

    // Change form title and button text
    formSectionTitle.textContent = "Edit Property";
    submitButton.textContent = "Update Property";
    cancelButton.classList.remove('hidden'); // Show cancel button
    propertyIdInput.disabled = true; // Disable Property ID editing to maintain uniqueness constraint
    
    // Scroll to the top of the form
    form.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Clears the form and reverts to "Add New Property" mode.
 */
function cancelEdit() {
    form.reset(); // Clear all form fields
    propertyDbIdInput.value = ''; // Clear hidden ID
    currentEditPropertyId = null; // Reset edit mode

    // Revert form title and button text
    formSectionTitle.textContent = "Add New Property";
    submitButton.textContent = "Add Property";
    cancelButton.classList.add('hidden'); // Hide cancel button
    propertyIdInput.disabled = false; // Re-enable Property ID for new entries
}

/**
 * Handles form submission (Add or Update).
 * @param {Event} event - The form submission event.
 */
async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(form);
    const propertyData = {};
    formData.forEach((value, key) => {
        propertyData[key] = value;
    });

    // Convert numeric fields to numbers
    propertyData.built_year = parseInt(propertyData.built_year);
    propertyData.purchase_price = parseFloat(propertyData.purchase_price);
    propertyData.down_payment = parseFloat(propertyData.down_payment);
    propertyData.interest_rate = parseFloat(propertyData.interest_rate);

    // Placeholder for document upload handling - remove file object from JSON payload
    delete propertyData.document_upload;

    let apiEndpoint = '';
    let method = '';
    let successMessage = '';
    let errorMessage = '';

    if (currentEditPropertyId) {
        // This is an UPDATE operation
        apiEndpoint = `/company_finances/api/rental_properties/update/${currentEditPropertyId}`; // Use DB ID for update
        method = 'PUT'; // Use PUT for updates (RESTful)
        successMessage = "Property updated successfully!";
        errorMessage = "Failed to update property. ";
        // Property ID cannot be changed during edit mode (disabled in frontend)
        // If it were editable, server-side uniqueness check would still apply.
    } else {
        // This is an ADD operation
        apiEndpoint = '/company_finances/api/rental_properties/add';
        method = 'POST';
        successMessage = "Property added successfully!";
        errorMessage = "Failed to add property. ";

        // Client-side validation for Property ID uniqueness for ADD operations
        if (rentalPropertiesData.some(p => p.property_id === propertyData.property_id)) {
            showMessage("Error: Property ID must be unique.", "error");
            return;
        }
    }

    try {
        const response = await fetch(apiEndpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(propertyData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        showMessage(result.message || successMessage, "success");
        
        // After successful add/update, clear form and re-fetch data
        cancelEdit(); // Clears form and resets state
        initializeApp(); // Re-fetch and re-render all properties

    } catch (error) {
        console.error(`${errorMessage} Details:`, error);
        showMessage(errorMessage + error.message, "error");
    }
}

/**
 * Placeholder for viewing documents.
 * @param {string} propertyId - The ID of the property.
 */
function viewDocuments(propertyId) {
    showMessage(`Viewing documents for Property ID: ${propertyId} (Feature coming soon!)`, "info");
    console.log(`View documents for property ID: ${propertyId}`);
    // In a future iteration, this would open a modal or redirect to a document viewer
}

/**
 * Handles deleting a property.
 * @param {number} propertyId - The DATABASE ID of the property to delete.
 */
async function deleteProperty(propertyId) {
    const confirmed = await showConfirm(`Are you sure you want to delete property: ${propertyId}?`);
    if (!confirmed) {
        return; // User cancelled
    }

    try {
        // FIX: Sending the database 'id' instead of 'property_id' in the payload
        const response = await fetch('/company_finances/api/rental_properties/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: propertyId }) // Send the database ID
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        showMessage(result.message, "success");

        // Remove from local array and re-render
        rentalPropertiesData = rentalPropertiesData.filter(p => p.id !== propertyId); // Filter by DB ID
        renderProperties(rentalPropertiesData); // Re-render with updated data

    } catch (error) {
        console.error("Failed to delete property:", error);
        showMessage("Failed to delete property. " + error.message, "error");
    }
}

/**
 * Initializes the application by fetching existing properties.
 */
async function initializeApp() {
    try {
        const response = await fetch('/company_finances/api/rental_properties/data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        rentalPropertiesData = data; // Store fetched data
        renderProperties(rentalPropertiesData); // Render initial list

    } catch (error) {
        console.error("Error fetching initial property data:", error);
        showMessage("Failed to load property data. Please check the console and server.", "error");
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    form.addEventListener('submit', handleFormSubmission); // Form submission now calls new handler
    cancelButton.addEventListener('click', cancelEdit); // New cancel button listener
    document.getElementById('sort-by').addEventListener('change', sortProperties);
});
