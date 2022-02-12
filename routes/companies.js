const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const expressError = require("../expressError");
const slugify = require("slugify");

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
    const string = slugify("Hellow", {
      remove: /[*+~.()''"!:@#$%^&=?`]/,
      lower: true,
    });
    console.log(string);
    const { code } = req.params;
    console.log(code);
    const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [
      `${code}`,
    ]);
    const industries = await db.query(
      "SELECT i.industry FROM companies AS c LEFT JOIN companies_industries AS ci ON ci.company_code =c.code LEFT JOIN industries AS i ON ci.industry_id=i.id WHERE c.code=$1",
      [`${code}`]
    );
    const invoices = await db.query(
      "SELECT * FROM invoices WHERE comp_Code=$1",
      [`${code}`]
    );
    return res.json({
      company: results.rows,
      invoices: invoices.rows,
      industries: industries.rows.map((i) => i.industry),
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const code = slugify(name, {
      replacement: "",
      remove: /[*+~.()''"!:@]/,
      lower: true,
    });
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
