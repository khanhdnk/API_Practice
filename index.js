require('dotenv').config();
const { json } = require('body-parser');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
app.use(express.json());
app.use(cors());



function CheckAuthorize(req){
  const apiKey = req.header('x-api-key');
  if (!apiKey || apiKey != "hello"){
    res.send(JSON.stringify({
      success: false,
      message: "Unauthorized access!"
    }))
  }
}

const employeesLoginInfor = [
  {userName: "admin", password: "admin"}
]

const employees = [
    {id: 1, name: "Khanh"},
    {id: 2, name: "khanhdnk"},
    { id: 3, name: "Minh" },
    { id: 4, name: "Thang" },
    { id: 5, name: "travis" },
    { id: 6, name: "DNK" },
    { id: 7, name: "TestResult" },
    { id: 8, name: "Jira" }
]

app.get('/', (req, res) => {
  CheckAuthorize(req)
  res.send(JSON.stringify({
    success: true,
    message: "Authorized access"
  }));
    
  
  // const uuid = require('uuid');
  // return uuid.v4();
});

//get all employees
app.get('/api/employees', authenticateToken,(req, res) => {
  CheckAuthorize(req)

  res.send(JSON.stringify({
    success: true,
    data: employees,
    notice: "Successfully"

  }));
});

//get specific employee
app.get('/api/employees/:id', (req, res) => {
  CheckAuthorize(req)

  const theEmployee = employees.find(course => course.id === parseInt(req.params.id));
  if (!theEmployee) {
    res.status(404).send('Not exist');
  }
  res.send(JSON.stringify({
    success: true,
    data:{
      id: theEmployee.id,
      name: theEmployee.name
    },
    notice: "Successfully"
    
  }));
});

//add employee
app.post('/api/employees/add', (req, res) => {
  CheckAuthorize(req)

  const course = {
    id: parseInt(req.body.id),
    name: req.body.name,
  }
  employees.push(course);
  res.send(JSON.stringify({
    success: true,
    notice: "Added successfully",
  }));
});

//update a employee

app.put('/api/employees/edit/:id',  (req, res) => {
  CheckAuthorize(req)

  const theEmployee = employees.find(employee => employee.id === parseInt(req.params.id));
  if (!theEmployee){
    res.status(404).send("Not exist");
  }

  theEmployee.name = req.body.name;
  res.send(JSON.stringify({
    success: true,
    notice: "successfully",
  }));
});



//delete the employee
app.delete('/api/employees/delete/:id', (req, res) => {
  CheckAuthorize(req)

  const theEmployee = employees.find(employee => employee.id === parseInt(req.params.id));
  if (!theEmployee){
    res.status(404).send("Not exist");
  }
  employees.splice(employees.indexOf(theEmployee), 1);
  res.send(JSON.stringify({
    success: true,
    notice: "Deleted successfully",
  }))
});


//login
app.post('/api/login', (req,res) => {
  CheckAuthorize(req);
  // //.json body??
  const userName = req.body.userName;
  // const password = req.body.password;
  const user = {name: userName};
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  // const employeeLogin = employeesLoginInfor.find(userLoginInfor => userLoginInfor.userName === (userName) && userLoginInfor.password === (password));
  // if (!employeeLogin){
  //   res.status(404).send("Not exist");
  // }

  res.send(JSON.stringify({
    success: true,
    notice: "login successfully",
    data: accessToken
  }))
})

function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (token == undefined) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user;
    next();
  })
}
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
