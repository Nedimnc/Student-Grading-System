document.addEventListener('DOMContentLoaded', function() {
    // Handle dynamic creation of grading rows (Encapsulation + List Construction)
    document.getElementById('addRowBtn').addEventListener('click', function() {
        const rowIndex = document.querySelectorAll('#gradingTable tbody tr').length + 1; // Determine index for unique naming
        const row = document.createElement('tr'); // Create new table row element

        // Template for input fields (Assessment Name, Grades, Weight)
        row.innerHTML = `
            <td><input type="text" name="assessment_name_${rowIndex}" placeholder="e.g., Project"></td>
            <td><input type="text" name="grades_${rowIndex}" placeholder="Grades (comma separated)"></td>
            <td><input type="number" name="weight_${rowIndex}" placeholder="Weight"></td>
            <td><button type="button" class="removeRowBtn">Remove</button></td>
        `;

        document.querySelector('#gradingTable tbody').appendChild(row); // Add row to DOM

        // Remove row if user clicks "Remove" button (Scope-local listener)
        row.querySelector('.removeRowBtn').addEventListener('click', function() {
            row.remove();
        });
    });

    // Handle student form submission (Form → Backend communication)
    document.getElementById('studentForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form behavior
        const formData = new FormData(this); // Capture form data into FormData object

        // POST data to Flask backend for processing
        fetch('/add_student', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Student added:', data);
            let studentTableBody = document.querySelector('#studentTable tbody');
            studentTableBody.innerHTML = ''; // Clear existing data

            // Display each student and their assessments (Data Abstraction)
            data.forEach(student => {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.assessments.map(a => `${a.assessment_name}: ${a.grades.join(', ')}`).join('<br>')}</td>
                    <td>${student.weighted_average.toFixed(2)}</td>
                    <td><button class="whatIfBtn">What If?</button></td>
                `;
                studentTableBody.appendChild(row);
            });

            document.getElementById('studentForm').reset(); // Clear form inputs
        })
        .catch(error => {
            alert('Error adding student');
            console.error('Error:', error);
        });
    });

    // Simple average calculator (No weights - just arithmetic mean)
    document.getElementById('simpleAvgBtn').addEventListener('click', function() {
        let simpleGradesInput = document.getElementById('simpleGrades').value;
        let simpleGrades = simpleGradesInput.split(',').map(num => parseFloat(num.trim()));

        if (simpleGrades.length > 0) {
            let simpleAverage = simpleGrades.reduce((sum, grade) => sum + grade, 0) / simpleGrades.length;
            document.getElementById('simpleAvgResult').textContent = `The average is: ${simpleAverage.toFixed(2)}`;
        } else {
            alert('Please enter some grades.');
        }
    });

    // Handle What If simulation (Dynamic UI logic for simulating alternate grade scenarios)
    document.addEventListener("click", function (e) {
        // When user clicks "What If?" button
        if (e.target && e.target.classList.contains("whatIfBtn")) {
            const row = e.target.closest("tr");
            const assessmentsCell = row.querySelector("td:nth-child(2)");
            const averageCell = row.querySelector("td:nth-child(3)");

            // Turn each assessment's grade display into editable input field
            const originalAssessments = assessmentsCell.innerHTML.split("<br>").map((a, i) => {
                const [name, grades] = a.split(":");
                return `<div>
                    <label>${name.trim()}:</label>
                    <input type="text" class="whatIfGradeInput" data-label="${name.trim()}" value="${grades.trim()}">
                </div>`;
            });

            assessmentsCell.innerHTML = originalAssessments.join("");

            // Change button to recalculate mode
            e.target.textContent = "Recalculate";
            e.target.classList.remove("whatIfBtn");
            e.target.classList.add("recalculateBtn");
        }

        // When user clicks "Recalculate" button
        if (e.target && e.target.classList.contains("recalculateBtn")) {
            const row = e.target.closest("tr");
            const assessmentsCell = row.querySelector("td:nth-child(2)");
            const averageCell = row.querySelector("td:nth-child(3)");

            // Re-parse all grade inputs and recalculate the new average
            const inputs = assessmentsCell.querySelectorAll(".whatIfGradeInput");
            let grades = [];

            inputs.forEach(input => {
                const gradeValues = input.value.split(',').map(g => parseFloat(g.trim()));
                gradeValues.forEach(g => {
                    if (!isNaN(g)) grades.push(g);
                });
            });

            const newAvg = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
            averageCell.textContent = newAvg.toFixed(2); // Update UI with recalculated average
        }
    });
});