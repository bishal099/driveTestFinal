// g_page.js

// Submit event listener to the form for user Information

document.addEventListener("DOMContentLoaded", function () {
    const userInfoForm = document.getElementById("gPageForm");
    const userInfoSection = document.getElementById("userInformationSection");

    userInfoForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        userInfoSection.style.display = "block"; // Show the User Information section
    });
});