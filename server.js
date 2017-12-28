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
      result.render("login");
});

app.get("/:id", function(request, result) {
      result.render("catfirst", {name: request.params.id});
});

app.get("/feeling/:name/:id", function(request, result) {
      insertID(request.params.id,request.params.name);
      retrieveID(request.params.id,request.params.name,result);
      // result.render("cat", {feeling: request.params.id, name:request.params.name, stats:stat});
});

function insertID(id,name) {
  const today = new Date();
  console.log(today);
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
    "SELECT * FROM feeling where name = $1::text ORDER BY date DESC",
    [name],
    function(error, result1) {
      if (error) {
        console.warn(error);
      }
      // return result1.rows;
      result.render("cat", {feeling:id, name:name, stats:result1.rows})
      client.end();
    }
  );
}
