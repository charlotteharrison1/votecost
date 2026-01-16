const { DatabaseSync } = require('node:sqlite')
const database = new DatabaseSync('votecost.sqlite', { "readOnly": true })
const headers = { "Content-type": "application/json" }


const handler = async function (event, context) {
  if (event.body) {
    event.body = JSON.parse(event.body)
    const sql = event.body.sql
    const params = event.body.params
    if (!sql) {
      return {
        headers,
        statusCode: 400,
        body: JSON.stringify({ "ok": false, "message": "Missing required sql parameter" })
      }
    }
    //console.log("sql", sql )
    ///console.log("params ", params)
    //console.log("preparing statement")
    try {
      const query = database.prepare(sql)
      var ret = query.all(...params)

      return {
        headers,
        statusCode: 200,
        body: JSON.stringify({ "ok": true, "message": ret })
      }

    } catch (e) {
      console.log(e)
      return {
        headers,
        statusCode: 400,
        body: JSON.stringify({ "ok": false, "message": "Unable to execute supplied sql" })
      }

    }
    //console.log (ret)

  }
}

module.exports = {
  handler: handler
}