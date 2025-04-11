document.addEventListener('DOMContentLoaded', function() {
    // Add dynamic rows for grading criteria (Project, Test, Midterm, etc.)
    document.getElementById('addRowBtn').addEventListener('click', function() {
        // Get the current number of rows to generate a unique index for new rows
        const rowIndex = document.querySelectorAll('#gradingTable tbody tr').length + 1;
        const row = document.createElement('tr');

        // Add a new row with input fields for assignment name, grades, and weight
        row.innerHTML = `
            <td><input type="text" name="assessment_name_${rowIndex}" placeholder="e.g., Project"></td>
            <td><input type="text" name="grades_${rowIndex}" placeholder="Grades (comma separated)"></td>
            <td><input type="number" name="weight_${rowIndex}" placeholder="Weight"></td>
            <td><button type="button" class="removeRowBtn">Remove</button></td>
        `;
        
        // Append the new row to the table
        document.querySelector('#gradingTable tbody').appendChild(row);

        // Add event listener to remove the row when the "Remove" button is clicked
        row.querySelector('.removeRowBtn').addEventListener('click', function() {
            row.remove();
        });
    });

    // Handle form submission and send data to the backend (Flask)
    document.getElementById('studentForm').addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the form from submitting in the default way
        
        const formData = new FormData(this);  // Gather form data
        
        // Send the form data to the backend using the fetch API
        fetch('/add_student', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            console.log('Student added:', data);

            // Update the student table with the returned data from the backend
            let studentTableBody = document.querySelector('#studentTable tbody');
            studentTableBody.innerHTML = '';  // Clear the existing student data

            // Loop through the student data and display it in the table
            data.forEach(student => {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.assessments.map(a => `${a.assessment_name}: ${a.average_grade}`).join('<br>')}</td>
                    <td>${student.weighted_average.toFixed(2)}</td>
                `;
                studentTableBody.appendChild(row);
            });

            // Clear the form after submission
            document.getElementById('studentForm').reset();
        })
        .catch(error => {
            alert('Error adding student');
            console.error('Error:', error);
        });
    });

    // Calculate simple average for a set of grades (no weights)
    document.getElementById('simpleAvgBtn').addEventListener('click', function() {
        let simpleGradesInput = document.getElementById('simpleGrades').value;  // Get the input grades
        let simpleGrades = simpleGradesInput.split(',').map(num => parseFloat(num.trim()));  // Split and convert grades to numbers

        // If grades exist, calculate the average
        if (simpleGrades.length > 0) {
            let simpleAverage = simpleGrades.reduce((sum, grade) => sum + grade, 0) / simpleGrades.length;
            document.getElementById('simpleAvgResult').textContent = `The average is: ${simpleAverage.toFixed(2)}`;  // Display the average
        } else {
            alert('Please enter some grades.');  // If no grades are entered
        }
    });
});
