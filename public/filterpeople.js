function filterPeopleByHouse() {
    //get the id of the selected homeworld from the filter dropdown
    var house_id = document.getElementById('house_filter').value
    console.log("house id is");
    console.log(house_id);
    //construct the URL and redirect to it
    window.location = '/people/filter/' + parseInt(house_id)
}
