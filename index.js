const { json } = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
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
app.get('/api/employees', (req, res) => {
  CheckAuthorize(req)

  res.send(employees);
});

//get specific employee
app.get('/api/employees/:id', (req, res) => {
  CheckAuthorize(req)

  const theEmployee = employees.find(course => course.id === parseInt(req.params.id));
  if (!theEmployee) {
    res.status(404).send('Not exist');
  }
  res.send(JSON.stringify({
    id: theEmployee.id,
    name: theEmployee.name
  }));
});

//add employee
app.post('/api/employees/add', (req, res) => {
  CheckAuthorize(req)

  const course = {
    id: req.body.id,
    name: req.body.name,
  }
  employees.push(course);
  res.send(JSON.stringify({
    success: true,
    notice: "Added successfully",
    data: employees
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
    data: employees
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
    data: employees
  }))
});

// const server = http.createServer((req, res) => {
//   res.setHeader('Content-type', 'application/json')
//   res.writeHeader(404, {
//     'Content-type' : 'application/json',
//     'X-Powered-By' : 'Node.js'
//   })
//   res.end(JSON.stringify({
//     success: false,
//     error: "Not Found",
//     data: null
//   }))
// });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on port 3000'));
