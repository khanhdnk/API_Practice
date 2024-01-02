require('dotenv').config();
const { json } = require('body-parser');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cors());

app.use(cookieParser());
const timeToAlive = 150;

const employeesLoginInfor = [
  {userName: "admin", password: "admin"}
]
// const { dayToMilisecond, hourToMilisecond, minToMilisecond, secondToMilisecond } = require('./milisecondGenerator.js');

function dayToMilisecond(day){
  return day * 24 * 60 * 60 * 1000;
}

function hourToMilisecond(hour){
  return hour * 60 * 60 * 1000;
}

function minToMilisecond(min){
  return min * 60 * 1000;
}

function secondToMilisecond(sec){
  return sec * 1000;
}








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

//get all employees
app.get('/api/employees', authenticateToken,(req, res) => {
  

  res.send(JSON.stringify({
    success: true,
    data: employees,
    notice: "Successfully"

  }));
});

//get specific employee
app.get('/api/employees/:id', authenticateToken, (req, res) => {
  

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
app.post('/api/employees/add', authenticateToken, (req, res) => {
  

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

app.put('/api/employees/edit/:id', authenticateToken,  (req, res) => {
  

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
app.delete('/api/employees/delete/:id', authenticateToken, (req, res) => {
  

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
  const password = req.body.password;
  const matchedEmployee = employeesLoginInfor.find(employee => {
    return employee.userName === userName && employee.password === password;
  });
  if (matchedEmployee){
    const user = {name: userName};
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: minToMilisecond(7) });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: dayToMilisecond(1) });
    res.send(JSON.stringify({
      success: true,
      notice: "login successfully",
      token: accessToken,
      refreshToken: refreshToken
    }))
  }else{
      res.status(401).send("no");
  }

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
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  // if (token == undefined) return res.sendStatus(401);
  const accessToken = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  console.log(accessToken)
  
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
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
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '30m'});
  refreshTokenDatabase.push(refreshToken);
  return refreshToken;

}
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
