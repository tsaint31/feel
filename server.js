const fetch = require("node-fetch");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const MAPWEATHER_ID=process.env.MAPWEATHER_ID;
const PG = require("pg");
const nunjucks = require("nunjucks");

nunjucks.configure("views", {
  autoescape: true,
  express: app
});

app.set("views", __dirname + "/views");
app.set("view engine", "njk");

app.listen(port, function () {
    console.log("Server listening on port:" + port);
  });

app.use(express.static('./images/'));

app.get("/", function(request, result) {
  login(result);
});

app.get("/:id", function(request, result) {
      result.render("catfirst", {name: request.params.id});
});

app.get("/feeling/:name/:id", function(request, result) {
      insertID(request.params.id,request.params.name);
      retrieveID(request.params.id,request.params.name,result);
});

app.get("/stats/:name", function(request, result) {
      retrieveID(0,request.params.name,result);
});

function login(result) {
  const client = new PG.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
  console.log(process.env.DATABASE_URL);
  client.connect();
  client.query(
    "SELECT COUNT (DISTINCT name) from feeling",
    [],
    function(error, result1) {
      if (error) {
        console.warn(error);
      }
      result.render("login", {users:result1.rows});
      client.end();
});
}

function insertID(id,name) {
  const today = new Date();
  const client = new PG.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
  client.connect();
  client.query(
    "INSERT INTO feeling (date,feeling,name) VALUES ($1::timestamp,$2::integer,$3::text);",
    [today, id,name],
    function(error, result1) {
      if (error) {
        console.warn(error);
      }
      client.end();
    }
  );
}

function retrieveID(id,name,result) {
  const client = new PG.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
  client.connect();
  client.query(
    "SELECT * FROM feeling where name = $1::text ORDER BY date DESC limit 10",
    [name],
    function(error, result1) {
      if (error) {
        console.warn(error);
      }
      client.query(
      "SELECT COUNT (feeling),feeling from feeling where name=$1::text and date_part('year', date) = date_part('year', CURRENT_DATE) GROUP BY feeling ORDER BY feeling DESC",
      [name],
      function(error, result2) {
        if (error) {
          console.warn(error);
        }
      result.render("cat", {feeling:id, name:name, stats:result1.rows, yearstats:result2.rows})
      client.end();
    }
  );
}
);
}
