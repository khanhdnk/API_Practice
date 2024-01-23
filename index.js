require('dotenv').config();
const { json } = require('body-parser');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express();
const cookieParser = require('cookie-parser');
app.use(express.json());
// app.use(cors({origin: "*"}));
app.use(cors({origin: ['http://192.168.1.117:3000', 'http://localhost:3000'],credentials: true }));


app.use(cookieParser());
const timeToAlive = 15;
const aliveTimeRefreshToken = 30;

const employeesLoginInfor = [
  {userName: "admin", password: "admin"}
]

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
app.get('/api/employees', checkToken,(req, res) => {
  

  res.send(JSON.stringify({
    success: true,
    data: employees,
    notice: "Successfully good api"

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
  

  const
   theEmployee = employees.find(employee => employee.id === parseInt(req.params.id));
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
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: secondToMilisecond(timeToAlive), sameSite: 'None', secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: minToMilisecond(15), sameSite: 'None', secure: true });
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
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken;
  console.log(accessToken + "\n" + refreshToken)
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.cookie('accessToken', '', { httpOnly: true, maxAge: secondToMilisecond(timeToAlive), sameSite: 'None', secure: true });
  res.cookie('refreshToken', '', { httpOnly: true, maxAge: minToMilisecond(15), sameSite: 'None', secure: true });
  if (refreshToken){
    console.log("found");
    refreshTokenDatabase = refreshTokenDatabase.filter(token => refreshToken !== token);
  }
  res.send(JSON.stringify({
    success: true,
    notice: "Successfully logout",
  }))

})


app.post('/api/checkToken', middleWare, (req, res) => {
  res.send(JSON.stringify({
    success: true,
    notice: "Legit access token"
  }))
})


app.post('/api/checkRefreshToken', (req, res) => {

  res.send(JSON.stringify({
    success: true,
    notice: "Legit refresh token"
  }))
})



































console.log("hello world no helloword 2");


function checkToken(req, res, next) {
  console.log("there is a response that is comming");

  // const accessToken = req.cookies.accessToken;
  const accessToken = req.headers.authorization;
  console.log(accessToken);
  // const refreshToken = req.cookies.refreshToken;
  const userInfo = {userName: req.body.userName}

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Access token is expired or invalid
      const refreshToken = req.cookies.refreshToken;
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, refreshedUser) => {
        if (err || !refreshTokenDatabase.find(token => refreshToken == token)) {
          return res.sendStatus(403);
        }

        const newAccessToken = generateAccessToken(userInfo);
        res.cookie('accessToken', newAccessToken, { httpOnly: true, maxAge: secondToMilisecond(timeToAlive), sameSite: 'None', secure: true });
        req.user = refreshedUser;
        next();
      });
    } else {
      // Access token is valid
      req.user = user;
      next();
    }
  });
}


function middleWare(req, res, next) {
  console.log("there is a response that is comming");

  // const accessToken = req.cookies.accessToken;
  const accessToken = req.body.accesstoken;
  console.log(accessToken);
  // const refreshToken = req.cookies.refreshToken;
  const userInfo = {userName: req.body.userName}

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // Access token is expired or invalid
      const refreshToken = req.cookies.refreshToken;
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, refreshedUser) => {
        if (err || !refreshTokenDatabase.find(token => refreshToken == token)) {
          return res.sendStatus(403);
        }

        const newAccessToken = generateAccessToken(userInfo);
        res.cookie('accessToken', newAccessToken, { httpOnly: true, maxAge: secondToMilisecond(timeToAlive), sameSite: 'None', secure: true });
        req.user = refreshedUser;
        next();
      });
    } else {
      // Access token is valid
      req.user = user;
      next();
    }
  });
}



function generateAccessToken(user) {
  try {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
}

function checkRefreshToken(req, res, next) {
  const refreshToken = req.cookies.refreshToken;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}


function generateRefreshToken(user) {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: `${aliveTimeRefreshToken}m` });
  refreshTokenDatabase.push(refreshToken);
  return refreshToken;
}
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
