module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getClasses(res, mysql, context, complete) {
      mysql.pool.query("SELECT className, instructors.lastName, maxCap, minCap, ageRequirement, departments.departmentID \
                        FROM classes INNER JOIN instructors ON instructors.instructorID = classes.instructorID \
                        INNER JOIN departments ON departments.departmentID = classes.departmentID", function(error, results, fields){
        if (error){
          res.write(JSON.stringify(error));
          res.end();
        }
        context.classes = results;
        console.log(results);
        complete();
      });
    }

    function getInstructors(res, mysql, context, complete) {
      mysql.pool.query("SELECT instructorID, lastName FROM instructors", function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        context.instructors = results;
        complete();
      });
    }

    function getDepartments(res, mysql, context, complete) {
      mysql.pool.query("SELECT departmentID, departmentName FROM departments", function(error, results, fields) {
        if (error) {
          res.write(JSON.stringify(error));
          res.end();
        }
        context.departments = results;
        complete();
      });
    }

    router.get('/', function(req, res){
      var callbackCount = 0;
      var mysql = req.app.get('mysql');
      var context = {};
      context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
      var mysql = req.app.get('mysql');
      getClasses(res, mysql, context, complete);
      getDepartments(res, mysql, context, complete);
      getInstructors(res, mysql, context, complete);
      function complete() {
        callbackCount++;
        if(callbackCount >=3) {
          res.render('classes', context);
        }
      }
    });

    router.post('/', function(req, res){
      var mysql = req.app.get('mysql');
      var sql = "INSERT INTO classes (className, maxCap, minCap, ageRequirement, instructorID, departmentID) VALUES (?, ?, ?, ?, ?, ?)";
      var inserts = [req.body.className, req.body.maxCap, req.body.minCap, req.body.ageRequirement, req.body.instructorID, req.body.departmentID];
      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }else{
              res.redirect('/classes');
          }
      });
    });












    /*
    function servePlanets(req, res){
        console.log("You asked me for some planets?")
        var query = 'SELECT planet_id, name, population FROM bsg_planets';
        var mysql = req.app.get('mysql');
        var context = {};

        function handleRenderingOfPlanets(error, results, fields){
          console.log(error)
          console.log(results)
          console.log(fields)
          //take the results of that query and store ti inside context
          context.planets = results;
          //pass it to handlebars to put inside a file
          res.render('houses', context)
        }
        //execute the sql query
        mysql.pool.query(query, handleRenderingOfPlanets)

        //res.send('Here you go!');
    }

    function serveOnePlanet(chicken, steak) {
      console.log(chicken.params.fancyId);
      console.log(chicken.params);
      fancyId = chicken.params.fancyId

      var queryString = "SELECT planet_id, name, population, language, capital FROM bsg_planets WHERE planet_id = ?"

      var mysql = steak.app.get('mysql')
      var context = {};

      function handleRenderingOfOnePlanet(error, results, fields){
          console.log("results are " + results)
          context.planet = results[0]
          console.log(context)

          if(error){
            console.log(error)
            steak.write(error)
            steak.end();
          }else{
            steak.render('houses',context);
          }
      }
      //execute the query
      var queryString = mysql.pool.query(queryString, fancyId, handleRenderingOfOnePlanet);

      //steak.send("Here's a good tasty well done steak");
    }

    router.get('/', servePlanets);
    router.get('/:fancyId', serveOnePlanet);
    */
    return router;
}();