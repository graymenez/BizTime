const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const expressError = require("../expressError");

router.use(express.json());

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM companies");
    console.log(results);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    console.log(code);
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      `${code}`,
    ]);
    const invoices = await db.query(
      "SELECT * FROM invoices WHERE comp_Code=$1",
      [`${code}`]
    );
    return res.json({ company: results.rows, invoices: invoices.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const addCompany = db.query("INSERT INTO companies VALUES ($1,$2,$3)", [
      code,
      name,
      description,
    ]);
    return res.json({
      "Company Added": { code: code, name: name, description: description },
    });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:code", async (req, res, next) => {
  try {
    const resCode = req.params.code;
    const { code, name, description } = req.body;
    const results = await db.query(
      "UPDATE companies SET name=$1,description=$2 WHERE code = $3 RETURNING code,name,description",
      [name, description, resCode]
    );
    if (results.rows.length === 0) {
      // If company not found

      console.log(results.rows.length);
      throw new ExpressError(
        `Company with code (${resCode}) was not found`,
        404
      );
    } else {
      // If company found updates company
      return res.json(results.rows);
    }
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const findCompany = await db.query(
      "SELECT * FROM companies WHERE code = $1",
      [code]
    );
    if (findCompany.rows.length === 0) {
      // If company not found

      throw new ExpressError(`Sorry, company with code ${code} not found`);
    } else {
      // If company if found then it is deleted from db

      await db.query("DELETE FROM companies WHERE code = $1", [code]);
      return res.json({ msg: "deleted" });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
