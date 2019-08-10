module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getDepartments(res, mysql, context) {
      mysql.pool.query("SELECT departmentName FROM departments", function(error, results, fields){
        if (error){
          res.write(JSON.stringify(error));
          res.end();
        }
        context.departments = results;
        console.log(context);
        res.render('departments', context);
      });
    }

    router.get('/', function(req, res){
      var mysql = req.app.get('mysql');
      var context = {};
      context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
      var mysql = req.app.get('mysql');
      getDepartments(res, mysql, context);
    });

    router.post('/', function(req, res){
      var mysql = req.app.get('mysql');
      var sql = "INSERT INTO departments (departmentName) VALUES (?)";
      var inserts = [req.body.departmentName];
      sql = mysql.pool.query(sql,inserts,function(error, results, fields){
          if(error){
              console.log(JSON.stringify(error))
              res.write(JSON.stringify(error));
              res.end();
          }else{
              res.redirect('/departments');
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