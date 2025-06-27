import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const port = 5000;

const adapter = new JSONFile('db.json');
const defaultData = { tasks: [] };
const db = new Low(adapter, defaultData);

/** Initialize database by reading and writing default data */
async function initDB() {
  await db.read();
  await db.write();
}

app.use(cors());
app.use(express.json());

/** Retrieve all tasks */
app.get('/tasks', (req, res) => {
  res.json(db.data.tasks);
});

/** Create a new task */
app.post('/tasks', async (req, res) => {
  const { text } = req.body;
  const newTask = { id: Date.now(), text, completed: false };
  db.data.tasks.push(newTask);
  await db.write();
  res.json(newTask);
});

/** Toggle completion status of a task by ID */
app.put('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = db.data.tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  db.data.tasks[taskIndex].completed = !db.data.tasks[taskIndex].completed;
  await db.write();
  res.json(db.data.tasks[taskIndex]);
});

/** Delete a task by ID */
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = db.data.tasks.length;
  db.data.tasks = db.data.tasks.filter(task => task.id !== id);
  
  if (db.data.tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  await db.write();
  res.sendStatus(200);
});

/** Start the server and initialize the database */
async function startServer() {
  await initDB();
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch(console.error);