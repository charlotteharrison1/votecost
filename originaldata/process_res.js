// create the expenditure table
const { DatabaseSync } = require('node:sqlite')
const database = new DatabaseSync('votecost.sqlite')

const types = {
    id : 'INTEGER',
    electorate : 'INTEGER',
    election_valid_vote_count : 'INTEGER',
    election_invalid_vote_count : 'INTEGER',
    election_url :'TEXT',
    election_result_summary :'TEXT',
    candidate_family_name :'TEXT',
    candidate_given_name :'TEXT',
    candidate_mnis_id : 'INTEGER',
    candidate_is_sitting_mp : 'INTEGER',
    candidate_is_former_mp : 'INTEGER',
    candidate_member_url :'TEXT',
    main_party_name :'TEXT',
    main_party_abbreviation :'TEXT',
    main_party_mnis_id : 'INTEGER',
    main_party_url :'TEXT',
    adjunct_party_name :'TEXT',
    adjunct_party_abbreviation :'TEXT',
    candidate_is_standing_as_commons_speaker : 'INTEGER',
    candidate_is_standing_as_independent : 'INTEGER',
    candidate_is_notional_political_party_aggregate : 'INTEGER',
    candidate_vote_count : 'INTEGER',
    candidate_vote_share: 'REAL',
    candidate_vote_change: 'REAL',
    majority : 'INTEGER',
    candidate_result_position : 'INTEGER'
}
// Execute SQL statements from strings.
database.exec(`
  CREATE TABLE IF NOT EXISTS results(
    id INTEGER PRIMARY KEY,
    electorate INTEGER,
    election_valid_vote_count INTEGER,
    election_invalid_vote_count INTEGER,
    election_url TEXT,
    election_result_summary TEXT,
    candidate_family_name TEXT,
    candidate_given_name TEXT,
    candidate_mnis_id INTEGER,
    candidate_is_sitting_mp INTEGER,
    candidate_is_former_mp INTEGER,
    candidate_member_url TEXT,
    main_party_name TEXT,
    main_party_abbreviation TEXT,
    main_party_mnis_id INTEGER,
    main_party_url TEXT,
    adjunct_party_name TEXT,
    adjunct_party_abbreviation TEXT,
    candidate_is_standing_as_commons_speaker INTEGER,
    candidate_is_standing_as_independent INTEGER,
    candidate_is_notional_political_party_aggregate INTEGER,
    candidate_vote_count INTEGER,
    candidate_vote_share REAL,
    candidate_vote_change REAL,
    majority INTEGER,
    candidate_result_position INTEGER
  ) STRICT
`);

const fs = require('fs')

const str = fs.readFileSync('./results.csv', { encoding: 'utf8' })
const lines = str.split('\r\n')
// extract headings by splitting the first line by , - 
// ignoring blank column headings
headings = lines[0].split(',').map((s) => {
  return s.toLowerCase()
}).filter((s) => {
  if (s.length > 0) {
    return true
  }
})

// for each line in the file
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
    v = v.replace(/"/g, '')

    // parse as float or integer if numeric
    if (v.match(/^[0-9\.]+$/) && v.indexOf('.') > -1) {
      v = parseFloat(v)
    } else if (v.match(/^[0-9]+$/)) {
      v = parseInt(v)
    } else if (v === 'TRUE') {
      v = 1
    } else if (v === 'FALSE') {
      v = 0
    }
    obj[heading] = v

    // knowing the type of each column, make sure
    // we don't put a empty string in a numeric field
    const t = types[heading]
    if (t === 'INTEGER' || t === 'REAL') {
      if (typeof obj[heading] === 'string') {
        obj[heading] = 0
      }
    }
  }
  
  // write a row the database
   const insert = database.prepare(`
       INSERT INTO results (
           id ,
    electorate ,
    election_valid_vote_count ,
    election_invalid_vote_count ,
    election_url ,
    election_result_summary ,
    candidate_family_name ,
    candidate_given_name ,
    candidate_mnis_id ,
    candidate_is_sitting_mp ,
    candidate_is_former_mp ,
    candidate_member_url ,
    main_party_name ,
    main_party_abbreviation ,
    main_party_mnis_id ,
    main_party_url ,
    adjunct_party_name ,
    adjunct_party_abbreviation ,
    candidate_is_standing_as_commons_speaker ,
    candidate_is_standing_as_independent ,
    candidate_is_notional_political_party_aggregate ,
    candidate_vote_count ,
    candidate_vote_share,
    candidate_vote_change,
    majority ,
    candidate_result_position )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  insert.run(...Object.values(obj))
}
