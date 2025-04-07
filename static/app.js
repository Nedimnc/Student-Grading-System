document.addEventListener('DOMContentLoaded', function() {
    // Add dynamic rows for grading criteria (Project, Test, Midterm, etc.)
    document.getElementById('addRowBtn').addEventListener('click', function() {
        const rowIndex = document.querySelectorAll('#gradingTable tbody tr').length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" name="assessment_name_${rowIndex}" placeholder="e.g., Project"></td>
            <td><input type="text" name="grades_${rowIndex}" placeholder="Grades (comma separated)"></td>
            <td><input type="number" name="weight_${rowIndex}" placeholder="Weight"></td>
            <td><button type="button" class="removeRowBtn">Remove</button></td>
        `;
        document.querySelector('#gradingTable tbody').appendChild(row);

        // Add event listener for the remove button in the newly added row
        row.querySelector('.removeRowBtn').addEventListener('click', function() {
            row.remove();
        });
    });

    // Handle form submission and send data to the backend
    document.getElementById('studentForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/add_student', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Student added:', data);
            
            // Display the updated student list with results
            let studentTableBody = document.querySelector('#studentTable tbody');
            studentTableBody.innerHTML = '';
            data.forEach(student => {
                let row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.name}</td>
                    <td>${student.assessments.map(a => `${a.assessment_name}: ${a.average_grade}`).join('<br>')}</td>
                    <td>${student.weighted_average.toFixed(2)}</td>
                `;
                studentTableBody.appendChild(row);
            });

            // Clear the input fields after submission
            document.getElementById('studentForm').reset();
        })
        .catch(error => {
            alert('Error adding student');
            console.error('Error:', error);
        });
    });

    // Calculate simple average for a set of grades (no weights)
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
});
