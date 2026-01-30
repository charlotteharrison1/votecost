
// create the expenditure table
const { DatabaseSync } = require('node:sqlite')
const database = new DatabaseSync('votecost.sqlite')

// Execute SQL statements from strings.
database.exec(`
  CREATE TABLE IF NOT EXISTS expenditure(
    id INTEGER PRIMARY KEY,
    resultid INTEGER,
    forename TEXT,
    surname TEXT,
    constituency_id TEXT,
    constituency TEXT,
    constituency_type TEXT,
    party_id INTEGER,
    candidate_party TEXT,
    nation TEXT,
    electorate_figure_on_return INTEGER,
    spending_limit_on_return REAL,
    electorate_figure_from_ro INTEGER,
    spending_limit_from_ro REAL,
    total_reported_spending REAL,
    actual_spending_recorded REAL,
    notional_spending_recorded REAL,
    unpaid_claims REAL,
    disputed_claims REAL,
    advertising REAL,
    unsolicited_material REAL,
    transport REAL,
    public_meetings REAL,
    agent_and_staff REAL,
    accommodation REAL,
    personal_expenses REAL,
    total_donations_accepted REAL,
    donations_rejected REAL
  ) STRICT
`);

const fs = require('fs')

const str = fs.readFileSync('./expenditure.csv', { encoding: 'utf8' })
const lines = str.split('\r\n')
headings = lines[0].split(',').map((s) => {
  return s.toLowerCase()
}).filter((s) => {
  if (s.length > 0) {
    return true
  }
})
for (i = 1; i < lines.length; i++) {
  console.log('Processing line ', i)
  let l = lines[i]
  if (l.length === 0) {
    continue
  }
  // find double-quoted strings
  const matches = l.match(/"[^"]+"/g)
  // get rid of commas in double-quoted strings
  for (m in matches) {
    l = l.replace(matches[m], matches[m].replace(",", ""))
  }

  // split the line into columns
  const cols = l.split(',')

  // loop through each column
  const obj = {}
  for (h in headings) {
    // find the column heading
    const heading = headings[h]

    // process each column value to remove pound signs & quotes
    let v = cols[h]
    v = v.replace('£', '')
    v = v.replace(/"/g, '')
    if (v === 'A' || v === 'B' || v === 'C' || v === 'X' || v === 'x' || v === '#REF!') {
      v = '0'
    }

    // parse as float or integer if numeric
    if (v.indexOf('.') > -1) {
      v = parseFloat(v)
    } else if (v.match(/^[0-9]+$/)) {
      v = parseInt(v)
    }
    obj[heading] = v
  }

  // write a row the database
  const insert = database.prepare(`
      INSERT INTO expenditure (
        id,resultid,forename,surname,constituency_id, constituency, 
        constituency_type ,  party_id , candidate_party ,  nation ,   
        electorate_figure_on_return,spending_limit_on_return ,
         electorate_figure_from_ro ,  spending_limit_from_ro ,  
         total_reported_spending ,  actual_spending_recorded ,  
         notional_spending_recorded ,  unpaid_claims , disputed_claims , 
         advertising ,  unsolicited_material ,  transport ,  public_meetings ,  
         agent_and_staff ,  accommodation ,  personal_expenses ,  
         total_donations_accepted ,   donations_rejected ) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insert.run(...Object.values(obj))
}
