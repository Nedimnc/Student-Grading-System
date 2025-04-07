from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

students = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_student', methods=['POST'])
def add_student():
    # Get the student name
    name = request.form['name']
    
    # Process each assessment's grades and weight
    assessments = []
    total_weight = 0
    weighted_sum = 0
    
    for key in request.form:
        if key.startswith('assessment_name'):
            assessment_name = request.form[key]
            grades_input = request.form.get(f'grades_{key.split("_")[-1]}')
            weight = float(request.form.get(f'weight_{key.split("_")[-1]}'))
            grades = list(map(int, grades_input.split(',')))
            
            average_grade = sum(grades) / len(grades)
            assessments.append({'assessment_name': assessment_name, 'average_grade': average_grade, 'weight': weight})
            
            weighted_sum += average_grade * (weight / 100)
            total_weight += weight
    
    if total_weight != 100:
        return jsonify({"error": "The total weight must be 100%"}), 400
    
    # Add the student data to the list
    students.append({'name': name, 'assessments': assessments, 'weighted_average': weighted_sum})
    
    return jsonify(students)

if __name__ == '__main__':
    app.run(debug=True)
