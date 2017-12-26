const fetch = require("node-fetch");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const MAPWEATHER_ID=process.env.MAPWEATHER_ID;


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
      result.render("cat", {feeling: 0});
});

app.get("/:id", function(request, result) {
      result.render("cat", {feeling: request.params.id});
});
