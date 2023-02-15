const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const startDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000");
    });
  } catch (err) {
    process.exit(1);
  }
};
startDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2 GET Method using id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const queryResult = await db.get(getQuery);
  response.send(queryResult);
});

//API 3 POST Method
app.post("/todos/", async (request, response) => {
  const queryDetails = request.body;
  const { id, todo, priority, status } = queryDetails;
  const addTodoDetails = `INSERT INTO todo 
  (id, todo, priority, status)
  VALUES (${id},
    '${todo}',
    '${priority}',
    '${status}')`;
  await db.run(addTodoDetails);
  response.send("Todo Successfully Added");
});

//API 4 PUT Method
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const queryDetails = request.body;
  const { status, todo, priority } = queryDetails;
  let updateTodoQuery = "";
  let todoStatus = "";
  if (todo !== undefined) {
    updateTodoQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    todoStatus = "${todo}";
  } else if (priority !== undefined) {
    updateTodoQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
    todoStatus = "${priority}";
  } else if (status !== undefined) {
    updateTodoQuery = `UPDATE todo SET priority = '${status}' WHERE id = ${todoId};`;
    todoStatus = "${status}";
  }
  await db.run(updateTodoQuery);
  response.send(`${todoStatus} Updated`);
});

//API DELETE Method
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo
  WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
