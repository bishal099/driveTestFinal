$(document).ready(function () {
    $("#showSlots").on("click", function () {
        var selectedDate = $("#date").val();
        $.ajax({
            type: "GET",
            url: "/getAvailableSlots?date=" + selectedDate,
            success: function (data) {
                // Update the available slots dynamically
                $("#slotContainer").empty();
                data.availableSlots.forEach(function (slot) {
                    var button = $("<button/>", {
                        class: slot.disabled ?
                            "btn btn-secondary mx-2 disabled" : "btn btn-primary mx-2",
                        name: "time",
                        value: slot.value,
                        text: slot.display,
                        disabled: slot.disabled,
                        title: slot.disabled ? "Already Set" : "Set Appointment Slot"
                    });
                    $("#slotContainer").append(button);
                });
            },
            error: function (error) {
                console.log("Error fetching available slots:", error);
            }
        });
    });
});