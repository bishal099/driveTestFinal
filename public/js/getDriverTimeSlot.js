document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('dateInput').addEventListener('change', fetchAndPopulateSlots);
    async function fetchAndPopulateSlots() {
        const selectedDate = document.getElementById('dateInput').value;
        try {
            const response = await fetch(`/getAvailableSlotsForDriver?date=${selectedDate}`);
            const data = await response.json();
            const timeSlotsSelect = document.getElementById('timeSlots');
            timeSlotsSelect.innerHTML = '';
            data.availableSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.time;
                option.textContent = slot.time;
                timeSlotsSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching available slots:', error);
        }
    }
});