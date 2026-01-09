
const options = {
}
const db = require('better-sqlite3')('../data/votecost.sqlite', options);
const levenshtein = require('js-levenshtein')

// const row = db.prepare('SELECT * FROM results WHERE id = ?').get('1');
// console.log(row);

function match(constituency) {
  // get all rows for that constituency from expenditure
  const erows = db.prepare('SELECT * FROM expenditure WHERE Constituency_ID = ?').all(constituency);
  
  // get all rows for that constituency from results
  const rrows = db.prepare('SELECT * FROM results WHERE Constituency_geographic_code = ?').all(constituency);
  
  // for each expenditure
  for(var i=0; i < erows.length; i++) {
    var e = erows[i]
    var ename = `${e.Forename.trim()} ${e.Surname.trim()}`
    var bestmatch = -1
    var bestscore = 10000000
    for (var j=0; j <rrows.length; j++) {
      var r = rrows[j]
      // don't bother with string distance for exact matches on surname
      // if (r.Candidate_family_name.trim() == e.Surname.trim()) {
      //   bestmatch = j
      //   break
      // }
      // split forename by space, so we can ignore middle names
      var n = r.Candidate_given_name.split(' ')
      var rname = `${n[0].trim()} ${r.Candidate_family_name.trim()}`
      var distance = levenshtein(ename, rname)
      if (distance < bestscore) {
        bestscore = distance
        bestmatch = j
      }
    }
    console.log('best match for', ename, bestscore, rrows[bestmatch].Candidate_given_name, rrows[bestmatch].Candidate_family_name)
    // write it back to expenditure
    const result = db.prepare('UPDATE expenditure SET resultid = ? WHERE id = ?').run(rrows[bestmatch].id, e.id);
  }
  
}

//match('S14000060')
function main() {

  // get a distinct list of constituency ids
  const cs = db.prepare('SELECT DISTINCT(Constituency_ID) FROM expenditure').all();

  // match each consitituency id
  for(var i = 0; i < cs.length ; i++) {
    var c = cs[i]
    var cid = c.Constituency_ID
    match(cid)
  }

}

main()
//

//match('E14001248')
