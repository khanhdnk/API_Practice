require('dotenv').config();
const { json } = require('body-parser');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
app.use(express.json());
app.use(cors());
const timeToAlive = 15;

const employeesLoginInfor = [
  {userName: "admin", password: "admin"}
]


let employees = [
    {id: 1, name: "Khanh"},
    {id: 2, name: "khanhdnk"},
    { id: 3, name: "Minh" },
    { id: 4, name: "Thang" },
    { id: 5, name: "travis" },
    { id: 6, name: "DNK" },
    { id: 7, name: "TestResult" },
    { id: 8, name: "Jira" }
]

let refreshTokenDatabase = [];

app.get('/', (req, res) => {
  
  res.send(JSON.stringify({
    success: true,
    message: "Authorized access"
  }));
    
  
  // const uuid = require('uuid');
  // return uuid.v4();
});

//get all employees
app.get('/api/employees', authenticateToken,(req, res) => {
  

  res.send(JSON.stringify({
    success: true,
    data: employees,
    notice: "Successfully"

  }));
});

//get specific employee
app.get('/api/employees/:id', (req, res) => {
  

  const theEmployee = employees.find(course => course.id === parseInt(req.params.id));
  if (!theEmployee) {
    res.status(404).send('Not exist');
    return;
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
  

  const theEmployee = employees.find(employee => employee.id === parseInt(req.params.id));
  if (!theEmployee){
    res.status(404).send("Not exist");
    return;
  }

  theEmployee.name = req.body.name;
  res.send(JSON.stringify({
    success: true,
    notice: "successfully",
  }));
});



//delete the employee
app.delete('/api/employees/delete/:id', (req, res) => {
  

  const theEmployee = employees.find(employee => employee.id === parseInt(req.params.id));
  if (!theEmployee){
    res.status(404).send("Not exist");
    return;
  }
  employees.splice(employees.indexOf(theEmployee), 1);
  res.send(JSON.stringify({
    success: true,
    notice: "Deleted successfully",
  }))
});


//login
app.post('/api/login', (req,res) => {
  const userName = req.body.userName;
  // const password = req.body.password;
  const user = {name: userName};
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  // const employeeLogin = employeesLoginInfor.find(userLoginInfor => userLoginInfor.userName === (userName) && userLoginInfor.password === (password));
  // if (!employeeLogin){
  //   res.status(404).send("Not exist");
  // }

  res.send(JSON.stringify({
    success: true,
    notice: "login successfully",
    token: accessToken,
    refreshToken: refreshToken
  }))
})

app.post('/api/logout', (req, res) => {

  const refreshToken = req.headers['authorization'];
  if (refreshToken){
    refreshTokenDatabase = refreshTokenDatabase.filter(token => refreshToken !== token);
  }
  res.send(JSON.stringify({
    success: true,
    notice: "Successfully logout",
  }))

})

app.post('/api/token', authenticateRefreshToken, (req, res) => {
  const userName = req.body.userName;
  const user = {name: userName};

  res.send(JSON.stringify({
    success: true,
    notice: "Successfully get new access token",
    data: generateAccessToken(user)
  }))
})

app.post('/api/checkAccessToken', authenticateToken, (req, res) => {

  res.send(JSON.stringify({
    success: true,
    notice: "Legit access token"
  }))
})

app.post('/api/checkRefreshToken', authenticateRefreshToken, (req, res) => {

  res.send(JSON.stringify({
    success: true,
    notice: "Legit refresh token"
  }))
})






































function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == undefined) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user;
    next();
  })
}

function authenticateRefreshToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == undefined) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user;
    next();
  })
}

function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: `${timeToAlive}s`});
}


function generateRefreshToken(user){
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '2h'});
  refreshTokenDatabase.push(refreshToken);
  return refreshToken;

}
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
