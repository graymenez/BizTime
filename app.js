/** BizTime express application. */

const express = require("express");
const app = express();
const ExpressError = require("./expressError");

app.use(express.json());

const companieRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");
const industriesRoute = require("./routes/industries");

app.use("/companies", companieRoutes);

app.use("/invoices", invoicesRoutes);

app.use("/industries", industriesRoute);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message,
  });
});

module.exports = app;
