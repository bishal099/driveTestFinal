document.addEventListener("DOMContentLoaded", function () {
    const logoutPost = document.getElementById("logoutId");
    logoutPost.addEventListener("click", function (event) {

        event.preventDefault();

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/logout"; //  POST request in /logout endpoint

        document.body.appendChild(form);
        form.submit();
    });
});