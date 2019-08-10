module.exports = function(){
    var express = require('express');
    var router = express.Router();

    /* get students to populate in dropdown */
    function getStudents(res, mysql, context, complete){
        mysql.pool.query("SELECT studentID, firstName, lastName FROM students", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.students = results;
            complete();
        });
    }

    /* get classes to populate in dropdown */
    function getClasses(res, mysql, context, complete){
        sql = "SELECT classID, className FROM classes";
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end()
            }
            context.classes = results
            complete();
        });
    }

    /* get people with their certificates */
    /* TODO: get multiple certificates in a single column and group on
     * fname+lname or id column
     */
    function getClassesForStudent(req, res, mysql, context, complete){
        query = "SELECT `students-classes`.studentID, `students-classes`.classID AS cid, classes.className AS name, instructors.lastName AS Instructor FROM `students-classes` INNER JOIN classes ON classes.classID=`students-classes`.classID INNER JOIN instructors ON classes.instructorID = instructors.instructorID WHERE `students-classes`.studentID = ?"
        //query = "SELECT * FROM `students-classes` WHERE studentID = ?";
        //sql = "SELECT pid, cid, CONCAT(fname,' ',lname) AS name, title AS certificate FROM bsg_people INNER JOIN bsg_cert_people on bsg_people.character_id = bsg_cert_people.pid INNER JOIN bsg_cert on bsg_cert.certification_id = bsg_cert_people.cid ORDER BY name, certificate"
        var inserts = [req.params.studentID];
         mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end()
            }
            context.student_classes = results
            complete();
        });
    }

    /* List people with certificates along with 
     * displaying a form to associate a person with multiple certificates
     */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js", "getClassesByStudent.js"];
        var mysql = req.app.get('mysql');

        getStudents(res, mysql, context, complete);
        getClasses(res, mysql, context, complete);
        //getClassesForStudent(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people_certs', context);
            }
        }
    });

    router.get('/search/:studentID', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js", "searchpeople.js", "getClassesByStudent.js"];
        var mysql = req.app.get('mysql');
        getClasses(res, mysql, context, complete);
        getClassesForStudent(req, res, mysql, context, complete);
        getStudents(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('people_certs', context);
            }
        }
    });
    /* Associate certificate or certificates with a person and 
     * then redirect to the people_with_certs page after adding 
     */
    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var query = "INSERT INTO `students-classes` (studentID, classID) VALUES (?, ?)"
        var inserts = [req.body.student, req.body.class];
        sql = mysql.pool.query(query, inserts, function(error, results, fields) {
            if (error) {
                console.log(JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('people_certs/search/'+ req.body.student);
            }
        });
    });

    /* Delete a person's certification record */
    /* This route will accept a HTTP DELETE request in the form
     * /pid/{{pid}}/cert/{{cid}} -- which is sent by the AJAX form 
     */
    router.delete('/pid/:pid/cert/:cid', function(req, res){
        //console.log(req) //I used this to figure out where did pid and cid go in the request
        console.log(req.params.pid)
        console.log(req.params.cid)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM `students-classes` WHERE studentID = ? AND classID = ?";
        var inserts = [req.params.pid, req.params.cid];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
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
