module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getHouses(res, mysql, context, complete){
        mysql.pool.query("SELECT houseID, houseName FROM houses", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.houses  = results;
            complete();
        });
    }

    function getInstructors(res, mysql, context, complete){
        mysql.pool.query("SELECT instructorID, firstName, lastName, houses.houseName FROM instructors \
                         INNER JOIN houses ON houses.houseID = instructors.houseID", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results;
            complete();
        });
    }

    function getInstructorsByHouse(req, res, mysql, context, complete){
      var query = "SELECT instructors.instructorID, firstName, lastName, houses.houseName FROM instructors INNER JOIN houses ON houses.houseID = instructors.houseID WHERE instructors.houseID = ?";
      console.log(req.params)
      var inserts = [req.params.houseID]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results;
            complete();
        });
    }

    /* Find people whose fname starts with a given string in the req */
    function getPeopleWithNameLike(req, res, mysql, context, complete) {
      //sanitize the input as well as include the % character
       var query = "SELECT instructorID, firstName, lastName, houses.houseName, FROM instructors INNER JOIN houses ON houses.houseID=instructors.houseID WHERE instructors.firstName LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)
      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results;
            complete();
        });
    }

    function getInstructor(res, mysql, context, id, complete){
        var sql = "SELECT instructorID, firstName, lastName, houseID FROM instructors WHERE instructorID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.instructors = results[0];
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getInstructors(res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('instructors', context);
            }
        }
    });

    /*Display all people from a given house. Requires web based javascript to delete users with AJAX*/
    /*
    router.get('/filter/:houseID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getInstructorsByHouse(req,res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('instructors', context);
            }
        }
    });
    */

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
    /*
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getInstructorsWithNameLike(req, res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('instructors', context);
            }
        }
    });
    */

    /* Display one person for the specific purpose of updating people */

    /*
    router.get('/:id', function(req, res){
        callbackCount = 0;
        console.log("req.params.id is");
        console.log(req.params.id);
        var context = {};
        context.jsscripts = ["selectedplanet.js", "updateperson.js"];
        var mysql = req.app.get('mysql');
        getInstructor(res, mysql, context, req.params.id, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-person', context);
            }

        }
    });
    */

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO instructors (firstName, lastName, houseID) VALUES (?,?,?)";
        var inserts = [req.body.firstName, req.body.lastName, req.body.houseID];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/instructors');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */
    /*

    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE students SET firstName=?, lastName=?, birthdate=?, houseID=?, wand=? WHERE studentID=?";
        var inserts = [req.body.firstName, req.body.lastName, req.body.birthdate, req.body.houseID, req.body.wand, req.params.id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });
    */

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM instructors WHERE instructorID = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();