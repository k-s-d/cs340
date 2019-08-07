function filterPeopleByHouse() {
    //get the id of the selected homeworld from the filter dropdown
    var house_id = document.getElementById('house_filter').value
    console.log("house id is");
    console.log(house_id);
    //construct the URL and redirect to it
    window.location = '/people/filter/' + parseInt(house_id)
}
function filterPeople() {
    //get the id of the selected homeworld from the filter dropdown
    var person_id = document.getElementById('person_select').value
    console.log("person id is");
    console.log(person_id);
    //construct the URL and redirect to it
    window.location = '/people_certs/search/' + parseInt(person_id)
}