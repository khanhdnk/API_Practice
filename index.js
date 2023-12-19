const express = require('express');
const app = express();
app.use(express.json());
const courses = [
    {id: 1, name: "NodeJS"},
    {id: 2, name: "khanhdnk"},
    { id: 3, name: "Python" },
    { id: 4, name: "Java" },
    { id: 5, name: "Oac" },
    { id: 6, name: "DNK" },
    { id: 7, name: "TestResult" },
    { id: 8, name: "Jira" }
]

app.get('/', (req, res) => {
  res.send('You are...');
});


app.get('/api/courses', (req, res) => {
  res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const theCourse = courses.find(course => course.id == req.params.id);
  if (!theCourse) {
    res.status(404).send('Not exist');
  }
  res.send(theCourse);
});

app.post('/api/courses/add', (req, res) => {
  const course = {
    id: req.body.id,
    name: req.body.name,
  }
  courses.push(course);
  res.send(JSON.stringify({
    success: true,
    notice: "Added successfully",
    data: courses
  }));
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
