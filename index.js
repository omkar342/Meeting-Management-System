const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const validator = require("validator");

const mysql = require("mysql");

require("dotenv").config();

const app = express();

const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const student = mongoose.createConnection("mongodb://localhost:27017/studentDB",{useNewUrlParser: true,
useUnifiedTopology: true,
useFindAndModify: false,
useCreateIndex: true});

const studentSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value,res){
            if (!validator.isEmail(value)){
                throw new Error ("Please enter valid Email.")
            }
        },
        minlength: [6,"Minimum length of email must be of greater than or equal to 5"]
    },
    password :{
        type: String,
        required: true,
        trim: true,
        minlength: [3,"Minimum length of password must be of greater than or equal to 3"]
    },
    confirmpassword :{
        type: String,
        required: true,
        trim: true,
        minlength: [3,"Minimum length of password must be of greater than or equal to 3"]
    }
})

const studentModel = student.model("Student",studentSchema);

const teacher = mongoose.createConnection("mongodb://localhost:27017/teacherDB",{useNewUrlParser: true,
useUnifiedTopology: true,
useFindAndModify: false,
useCreateIndex: true});

const teacherSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value,res){
            if (!validator.isEmail(value)){
                throw new Error ("Please enter valid Email.")
            }
        },
        minlength: [6,"Minimum length of email must be of greater than or equal to 5"]
    },
    password :{
        type: String,
        required: true,
        trim: true,
        minlength: [3,"Minimum length of password must be of greater than or equal to 3"]
    },
    confirmpassword :{
        type: String,
        required: true,
        trim: true,
        minlength: [3,"Minimum length of password must be of greater than or equal to 3"]
    }
})

const teacherModel = teacher.model("Teacher",teacherSchema);

app.get("/", function (req, res) {
  // res.sendFile(__dirname+"/index.html");
  res.render("index");
});

app.get("/student-signup", function (req, res) {
    var err = null;
    res.render("studentRegister" , {error : err});
});

app.post("/student-signup", function (req, res) {
    var err = null;
    if (req.body.password != req.body.confirmpassword){
        var err = new Error ("Password and Confirm Password doesn't match.");
        res.render("studentRegister" , {error : err});
    }
    else{
        const newStudent = new studentModel ({
        email : req.body.email,
        password : req.body.password,
        confirmpassword : req.body.confirmpassword
    });
    newStudent.save()
    .then(function(){
        pool.getConnection((err,connection)=>{
            if (err) throw err;
            console.log("Connected to DB " + connection.threadId);

            connection.query('SELECT * FROM `meetings`' , (err,rows)=>{
                connection.release();

                if (!err){
                    res.render("studentMeetings",{rows : rows});
                }
                else {
                    console.log(err);
                }
                // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
            })
        });
    })  
    .catch(function(err){
        console.log(err);
    })
}    
});

app.get("/student-signin", function (req, res) {
    var err = null;
    res.render("studentLogin",{error : err});
});

app.post("/student-signin",function(req,res){
    const userName = req.body.email;
    const userPassword = req.body.password;
    studentModel.findOne({email : userName},function(err,foundUser){
        var err = null;
        if (err) console.log(err);
        else {
            if (foundUser){
                if (foundUser.password === userPassword){
                    pool.getConnection((err,connection)=>{
                        if (err) throw err;
                        console.log("Connected to DB " + connection.threadId);

                        connection.query('SELECT * FROM `meetings`' , (err,rows)=>{
                            connection.release();

                            if (!err){
                                res.render("studentMeetings",{rows : rows});
                            }
                            else {
                                console.log(err);
                            }
                            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
                        })
                    });
                }
                else {
                    var err = new Error ("Invalid Username or Password.");
                    res.render("studentLogin" , {error : err});
                }
            }
        }
    })
})

app.get("/teacher-signup",function(req,res){
    var err = null;
    res.render("teacherRegister" , {error : err});
});

app.post("/teacher-signup", function (req, res) {
    var err = null;
    if (req.body.password != req.body.confirmpassword){
        var err = new Error ("Password and Confirm Password doesn't match.");
        res.render("studentRegister" , {error : err});
    }
    else{
        const newTeacher = new teacherModel ({
        email : req.body.email,
        password : req.body.password,
        confirmpassword : req.body.confirmpassword
    });
    newTeacher.save()
    .then(function(){
        res.render("teacherMeeting");
    })  
    .catch(function(err){
        console.log(err);
    })
}    
});

app.get("/teacher-signin",function(req,res){
    var err = null;
    res.render("teacherLogin" , {error : err});
});

const pool = mysql.createPool({
    connectionLimit : 100,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : "",
    database        : process.env.DB_NAME
});

app.post("/teacher-signin",function(req,res){
    const userName = req.body.email;
    const userPassword = req.body.password;
    teacherModel.findOne({email : userName},function(err,foundUser){
        var err = null;
        if (err) console.log(err);
        else {
            if (foundUser){
                if (foundUser.password === userPassword){
                    pool.getConnection((err,connection)=>{
                        if (err) throw err;
                        console.log("Connected to DB " + connection.threadId);

                        connection.query('SELECT * FROM `meetings`' , (err,rows)=>{
                            connection.release();

                            if (!err){
                                res.render("teacherMeeting",{rows : rows});
                            }
                            else {
                                console.log(err);
                            }
                            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
                        })
                    });
                }
                else {
                    var err = new Error ("Invalid Username or Password.");
                    res.render("teacherLogin" , {error : err});
                }
            }
        }
    })
});

app.get("/teachermeeting",function(req,res){
    pool.getConnection((err,connection)=>{
        if (err) throw err;
        console.log("Connected to DB " + connection.threadId);

        connection.query('SELECT * FROM `meetings`' , (err,rows)=>{
            connection.release();

            if (!err){
                res.render("teacherMeeting",{rows : rows});
            }
            else {
                console.log(err);
            }
            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
        })
    });
})

app.get("/addmeeting",function(req,res){
    var success = null;
    res.render("addMeeting",{success : success});
})

app.post("/addmeeting",function(req,res){
    const {topic,date,time,link} = req.body;

    if (!topic || !date || !time || !link){
        var success = 2;
        res.render("addMeeting",{success : success});
    }

    pool.getConnection((err,connection)=>{
        if (err) throw err;
        console.log("Connected to DB " + connection.threadId);

        connection.query('INSERT INTO meetings SET topic = ? , date = ? , timing = ? , link = ?',[topic,date,time,link] , (err,rows)=>{
            connection.release();

            if (!err){
                var success = 1;
                res.render("addMeeting",{success : success});
            }
            else {
                console.log(err);
            }
            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
        })
    });
});

app.get("/editmeeting/:id",function(req,res){
    var success = null;
    pool.getConnection((err,connection)=>{
        if (err) throw err;
        console.log("Connected to DB " + connection.threadId);

        connection.query('SELECT * FROM `meetings` WHERE id = ?',[req.params.id] , (err,rows)=>{
            connection.release();

            if (!err){
                res.render("editMeeting",{rows : rows,success : success});
            }
            else {
                console.log(err);
            }
            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
        })
    });
});

app.post("/editmeeting/:id",function(req,res){
    const {topic,date,time,link} = req.body;

    if (!topic || !date || !time || !link){
        var success = 2;
        res.render("editMeeting",{success : success});
    }

    pool.getConnection((err,connection)=>{
        if (err) throw err;
        console.log("Connected to DB " + connection.threadId);

        connection.query('UPDATE meetings SET topic = ? , date = ? , timing = ? , link = ? WHERE id = ?',[topic,date,time,link,req.params.id] , (err,rows)=>{
            connection.release();

            if (!err){
                pool.getConnection((err,connection)=>{
                    if (err) throw err;
                    console.log("Connected to DB " + connection.threadId);
            
                    connection.query('SELECT * FROM `meetings` WHERE id = ?', [req.params.id] , (err,rows)=>{
                        connection.release();
            
                        if (!err){
                            var success = 1;
                            res.render("editmeeting",{success : success , rows : rows});
                        }
                        else {
                            console.log(err);
                        }
                        // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
                    })
                });
            }
            else {
                console.log(err);
            }
            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
        })
    });
});

app.get("/:id",function(req,res){
    pool.getConnection((err,connection)=>{
        if (err) throw err;
        console.log("Connected to DB " + connection.threadId);

        connection.query('DELETE FROM `meetings` WHERE id = ?', [req.params.id] , (err,rows)=>{
            connection.release();

            if (!err){
                res.redirect("teacherMeeting");
            }
            else {
                console.log(err);
            }
            // console.log("Data from mysql server is : \n" + rows[0].date.toString().substring(0,15));
        })
    });
});

app.get("/studentmeetings",function(req,res){
    res.redirect("studentMeetings");
})

app.listen(port, function () {
  console.log(`Server is Running on Port ${port}`);
});