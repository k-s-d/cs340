function getClassesByStudent() {
    var student_id = document.getElementById('person_select').value;
    window.location = '/people_certs/search/' + parseInt(student_id)
}