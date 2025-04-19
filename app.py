# app.py
from flask import Flask, render_template, request, jsonify

# Create the Flask application instance (Encapsulation: hiding implementation details behind Flask's API)
app = Flask(__name__)

# In-memory storage for student records (List structure used for data organization)
students = []

# Route to render the main frontend interface
@app.route('/')
def index():
    return render_template('index.html')

# Route to process submitted student data
@app.route('/add_student', methods=['POST'])
def add_student():
    # Retrieve the student's name from the form input
    name = request.form['name']

    # Local variables to store assessment breakdown and calculations (Scope Rules)
    assessments = []
    total_weight = 0
    weighted_sum = 0

    # Iterate through the submitted form keys
    for key in request.form:
        # Look for assessment entries (e.g., assessment_name_1, grades_1, weight_1)
        if key.startswith('assessment_name'):
            index = key.split('_')[-1]
            assessment_name = request.form[key]  # Name of the assessment (e.g., Homework)
            grades_input = request.form.get(f'grades_{index}')  # Comma-separated grades
            weight = float(request.form.get(f'weight_{index}', 0))  # Weight of this assessment

            # If grades were entered, process them
            if grades_input:
                grades = list(map(float, grades_input.split(',')))  # Convert grades from string to float (Data Type Conversion)
                average_grade = sum(grades) / len(grades)  # Calculate average (Average Calculations)

                # Encapsulate assessment data in a dictionary (Data Abstraction)
                assessments.append({
                    'assessment_name': assessment_name,
                    'average_grade': round(average_grade, 2),
                    'grades': grades,
                    'weight': weight
                })

                # Accumulate the weighted sum
                weighted_sum += average_grade * (weight / 100)
                total_weight += weight

    # Check if total weights are valid (Input Validation / Error Handling)
    if total_weight != 100:
        return jsonify({"error": "The total weight must be 100%"}), 400

    # Add finalized student record to the list (Encapsulation of full student data)
    students.append({
        'name': name,
        'assessments': assessments,
        'weighted_average': round(weighted_sum, 2)
    })

    # Return updated list of students (Used by frontend to refresh display)
    return jsonify(students)

# Start the Flask server (Imperative Paradigm — Direct control over program flow)
if __name__ == '__main__':
    app.run(debug=True)