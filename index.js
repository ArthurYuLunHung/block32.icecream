const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_notes_32_ws"
);
const app = express();

app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM flavors`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = `SELECT * FROM flavors WHERE id=$1`;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
          INSERT INTO notes(name, is_favorite)
          VALUES($1, $2)
          RETURNING *
          `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
    ]);
  } catch (error) {
    next(error);
  }
});

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
          UPDATE flavors
          SET name=$1, is_favorite=$2, updated_at=now()
          WHERE id=$3
          RETURNING *
          `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
          DELETE from flavors
          WHERE id=$1
          `;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL =
    /* sql */
    `
  DROP TABLE IF EXISTS flavors;
  CREATE TABLE notes (
    
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    /* ranking INTEGER DEFAULT 3 NOT NULL, */
    name VARCHAR(255),
    is_favorite BOOLEAN DEFAULT FALSE
  )
  
  `;
  await client.query(SQL);
  console.log("tables created");

  SQL = /* sql */ `
  INSERT INTO flavors(name, is_favorite) VALUES('chocolate', true);
  INSERT INTO flavors(name, is_favorite) VALUES('pepper mint', false);
    INSERT INTO flavors(name, is_favorite) VALUES('strawberry', true);
    INSERT INTO flavors(name, is_favorite) VALUES('mango', true);
  `;
  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listen on port ${port}`));
};

init();
