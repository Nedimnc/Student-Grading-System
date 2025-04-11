from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Store student data in memory (could be replaced by a database)
students = []

@app.route('/')
def index():
    """
    Render the index page for the grading system.
    """
    return render_template('index.html')

@app.route('/add_student', methods=['POST'])
def add_student():
    """
    Handle the form submission and calculate weighted average for student grades.
    """
    # Get the student name
    name = request.form['name']
    
    # Process each assessment's grades and weight
    assessments = []  # List to hold assessment data
    total_weight = 0  # Total weight for all assessments
    weighted_sum = 0  # Sum of weighted grades
    
    for key in request.form:
        if key.startswith('assessment_name'):
            # Extract the assessment name, grades, and weight
            assessment_name = request.form[key]
            grades_input = request.form.get(f'grades_{key.split("_")[-1]}')
            weight = float(request.form.get(f'weight_{key.split("_")[-1]}'))
            grades = list(map(int, grades_input.split(',')))  # Convert grades to integers
            
            # Calculate the average grade for the assessment
            average_grade = sum(grades) / len(grades)
            assessments.append({'assessment_name': assessment_name, 'average_grade': average_grade, 'weight': weight})
            
            # Calculate the weighted sum of the grades
            weighted_sum += average_grade * (weight / 100)
            total_weight += weight
    
    # Ensure the total weight adds up to 100%
    if total_weight != 100:
        return jsonify({"error": "The total weight must be 100%"}), 400
    
    # Add the student data to the list
    students.append({'name': name, 'assessments': assessments, 'weighted_average': weighted_sum})
    
    # Return the updated list of students as JSON
    return jsonify(students)

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app with debugging enabled
