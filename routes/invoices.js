const express = require("express");
const router = express.Router();
const db = require("../db");
const expressError = require("../expressError");

router.use(express.json());

router.get("/", async (req, res, next) => {
  const results = await db.query("SELECT * FROM invoices");
  return res.json(results.rows);
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (results.rows.length === 0) {
      throw new expressError(
        `Sorry, invoice with the id:${id} does not exist`,
        404
      );
    }
    return res.json(results.rows);
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  const { comp_Code, amt, paid, paid_date } = req.body;
  const results = await db.query(
    "INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ($1,$2,$3,$4) RETURNING id,comp_Code,amt,paid,paid_date",
    [comp_Code, amt, paid, paid_date]
  );
  console.log(results.rows);
  return res.status(201).json(results.rows);
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comp_Code, amt, paid, paid_date } = req.body;
    const findInvoice = await db.query("SELECT * FROM invoices WHERE id=$1", [
      id,
    ]);
    if (findInvoice.rows.length === 0) {
      throw new expressError(
        `Sorry, invoice with the id:${id} does not exist`,
        404
      );
    }
    const results = await db.query(
      `UPDATE invoices SET comp_Code=$1,amt=$2,paid=$3,paid_date=$4 WHERE id=$5 RETURNING comp_Code`,
      [comp_Code, amt, paid, paid_date, id]
    );
    return res.json(results.rows);
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const findInvoice = await db.query("SELECT * FROM invoices WHERE id=$1", [
      id,
    ]);
    if (findInvoice.rows.length === 0) {
      throw new expressError(`Sorry, invoice with the id:${id} does not exist`);
    }
    const results = await db.query("DELETE FROM invoices WHERE id = $1", [id]);
    return res.json({ msg: `deleted invoice` });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
