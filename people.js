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

    function getStudents(res, mysql, context, complete){
        mysql.pool.query("SELECT studentID, firstName, lastName, birthdate, houses.houseName, wand FROM students \
                         INNER JOIN houses ON houses.houseID = students.houseID", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }

    function getStudentsByHouse(req, res, mysql, context, complete){
      var query = "SELECT students.studentID, firstName, lastName, houses.houseName, birthdate, wand FROM students INNER JOIN houses ON houses.houseID = students.houseID WHERE students.houseID = ?";
      console.log(req.params)
      var inserts = [req.params.houseID]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }

    /* Find people whose fname starts with a given string in the req */
    function getPeopleWithNameLike(req, res, mysql, context, complete) {
      //sanitize the input as well as include the % character
       var query = "SELECT studentID, firstName, lastName, houses.houseName, birthdate, wand FROM students INNER JOIN houses ON houses.houseID=students.houseID WHERE students.firstName LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)
      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }

    function getStudent(res, mysql, context, id, complete){
        var sql = "SELECT studentID, firstName, lastName, birthdate, houseID, wand FROM students WHERE studentID = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.person = results[0];
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getStudents(res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people', context);
            }
        }
    });

    /*Display all people from a given house. Requires web based javascript to delete users with AJAX*/
    router.get('/filter/:houseID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getStudentsByHouse(req,res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people', context);
            }
        }
    });

    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getPeopleWithNameLike(req, res, mysql, context, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people', context);
            }
        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:id', function(req, res){
        callbackCount = 0;
        console.log("req.params.id is");
        console.log(req.params.id);
        var context = {};
        context.jsscripts = ["selectedplanet.js", "updateperson.js"];
        var mysql = req.app.get('mysql');
        getStudent(res, mysql, context, req.params.id, complete);
        getHouses(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-person', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO students (firstName, lastName, birthdate, houseID, wand) VALUES (?,?,?,?,?)";
        var inserts = [req.body.firstName, req.body.lastName, req.body.birthdate, req.body.houseID, req.body.wand];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/people');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

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

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM students WHERE studentID = ?";
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
