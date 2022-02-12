const express = require("express");
const router = express.Router();
const expressError = require("../expressError");
const db = require("../db");
router.use(express.json());

router.get("/", async (req, res, next) => {
  const results = await db.query("SELECT * FROM industries");
  return res.json(results.rows);
});

router.get("/:id", async (req, res, next) => {
  const companyResults = await db.query(
    "SELECT i.industry_code,i.industry,c.code,c.name,c.description FROM industries AS i LEFT JOIN companies_industries AS ci ON ci.industry_id = i.id LEFT JOIN companies AS c ON ci.company_code= c.code WHERE i.id=$1",
    [req.params.id]
  );
  return res.json({
    industries: companyResults.rows[0].industry,
    companies: companyResults.rows.map((c) => c.name),
  });
});

// SELECT i.industry,c.name FROM industries AS i
// LEFT JOIN companies_industries AS ci
// ON ci.industry_id = i.id
// LEFT JOIN companies as c
// ON ci.company_code = c.code
// WHERE i.id = 1;

router.post("/", async (req, res, next) => {
  const { industry_code, industry } = req.body;
  const results = await db.query(
    "INSERT INTO industries (industry_code,industry) VALUES ($1,$2) RETURNING industry_code,industry",
    [industry_code, industry]
  );
  return res.json(results.rows);
});

module.exports = router;
