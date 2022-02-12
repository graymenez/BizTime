DROP DATABASE IF EXISTS biztime;
CREATE DATABASE biztime;

\c biztime

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries(
  id serial PRIMARY KEY,
  industry_code text NOT NULL,
  industry text NOT NULL
);
CREATE TABLE companies_industries(
  industry_id INTEGER NOT NULL REFERENCES industries,
  company_code text NOT NULL REFERENCES companies 
);

SELECT i.industry,c.name FROM industries AS i
LEFT JOIN companies_industries AS ci
ON ci.industry_id = i.id
LEFT JOIN companies as c
ON ci.company_code = c.code
WHERE i.id = 1;


INSERT INTO industries
(industry_code,industry)
VALUES
('acc','accounting'),
('bnk','banking');




INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);
INSERT INTO companies_industries
(industry_id,company_code)
VALUES
(1,'ibm'),
(1,'ibm'),
(2,'ibm'),
(2,'ibm');