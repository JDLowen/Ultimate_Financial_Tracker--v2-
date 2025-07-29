// static/js/nav.js
// This script handles the dropdown functionality for the navigation bar
document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.navbar-dropdown-btn');
    const navbarSidebar = document.querySelector('.navbar-sidebar'); // Get the sidebar element

    dropdowns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Close other dropdowns
            dropdowns.forEach(b => {
                if (b !== btn) {
                    b.classList.remove('active');
                    const otherContent = b.nextElementSibling;
                    if (otherContent && otherContent.classList.contains('navbar-dropdown-content')) {
                        otherContent.classList.remove('show');
                        // Reset icon for other dropdowns when they close
                        const otherIcon = b.querySelector('.dropdown-icon');
                        if (otherIcon) {
                            otherIcon.classList.remove('fa-chevron-up');
                            otherIcon.classList.add('fa-chevron-down');
                        }
                    }
                }
            });

            // Toggle the clicked dropdown
            btn.classList.toggle('active');
            const dropdown = btn.nextElementSibling;
            if (dropdown && dropdown.classList.contains('navbar-dropdown-content')) {
                dropdown.classList.toggle('show');
                // Toggle icon for the clicked dropdown
                const icon = btn.querySelector('.dropdown-icon');
                if (icon) {
                    if (dropdown.classList.contains('show')) {
                        icon.classList.remove('fa-chevron-down');
                        icon.classList.add('fa-chevron-up');
                    } else {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            }
        });
    });

    // NEW: Add mouseleave event listener to the entire sidebar
    if (navbarSidebar) {
        navbarSidebar.addEventListener('mouseleave', () => {
            // Close all active dropdowns when the mouse leaves the sidebar
            dropdowns.forEach(btn => {
                btn.classList.remove('active');
                const dropdownContent = btn.nextElementSibling;
                if (dropdownContent && dropdownContent.classList.contains('navbar-dropdown-content')) {
                    dropdownContent.classList.remove('show');
                    // Reset icon
                    const icon = btn.querySelector('.dropdown-icon');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                }
            });
        });
    }
});


//Observations:
//Event Listener for DOMContentLoaded: Good practice to ensure the DOM is fully loaded before trying to access elements.
//Select All Dropdown Buttons: document.querySelectorAll('.navbar-dropdown-btn') correctly selects all elements that should trigger a dropdown.
//Accordion Behavior: The forEach loop and the logic inside the click handler ensure that when one dropdown is opened, all other currently open dropdowns are closed. This creates an "accordion" effect, which is often desirable for sidebars to prevent clutter.
//Class Toggling: It correctly toggles active on the button and show on the content, which your CSS/SCSS will then use to manage visibility and styling.
//nextElementSibling: Reliably selects the associated dropdown content assuming the HTML structure (button immediately followed by content div).