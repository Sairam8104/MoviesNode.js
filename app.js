const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Dr Error:${e.message}`);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMovieName = `SELECT movie_name as movieName FROM movie;`;
  const movieNameArray = await db.all(getMovieName);
  response.send(movieNameArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createNewMovie = `INSERT INTO movie (director_id,movie_name,lead_actor)
  values(
    ${directorId},"${movieName}","${leadActor}"
  );`;
  await db.run(createNewMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieName = `SELECT movie_id as movieId,
  director_id as directorId,
  movie_name as movieName,
  lead_actor as leadActor FROM movie WHERE movie_id = ${movieId} ;`;
  const movieNameArray = await db.get(getMovieName);
  response.send(movieNameArray);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `UPDATE movie SET 
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT director_id as directorId,
    director_name as directorName FROM director;`;
  const directorsDetails = await db.all(getDirectors);
  response.send(directorsDetails);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMovieNames = `SELECT movie_name as movieName FROM movie INNER JOIN director ON 
    movie.director_id = director.director_id where movie.director_id = ${directorId};`;

  const movieNames = await db.all(getMovieNames);
  response.send(movieNames);
});

module.exports = app;
