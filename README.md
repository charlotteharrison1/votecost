# How much does a vote cost?

The idea of this project is to work out how much a party paid for each vote per constituency in the 2024 General Election.

The UK Parliament has a record of <a href="https://electionresults.parliament.uk/general-elections/6/turnout">how many</a> votes every candidate received.
          
The Electoral Commission publishes data on <a href="https://www.electoralcommission.org.uk/political-registration-and-regulation/financial-reporting/campaign-spending-candidates/2024-uk-parliamentary-general-election-candidate-spending?section=data&filters=%255B%257B%2522candidate%2522%253A%257B%2522id%2522%253A2122%252C%2522value%2522%253A%2522yuan%2520yang%2522%252C%2522label%2522%253A%2522Yuan%2520Yang%2522%252C%2522meta%2522%253A%255B%2522Labour%2520Party%2522%252C%2522Earley%2520and%2520Woodley%2522%255D%257D%257D%255D">how much</a> each candidate spent.

So in theory all you have to do is combine the two datasets to find out how much each candidate "paid" for every vote they received.

## The Data

In order to do this we:

1. Got both sets of data into Google Sheets and removed some unwanted columns (mainly things that were just derived from other columns)
2. Exported the simplified data into two tables in a sqlite database (results and expenditure)
3. Used the `match.js` script to go through each constituency, retrieve all result and expenditure rows for it and try to match a candidate name in the results  to a candidate in the expenditures. The constituency is quite unique and has an id, so that is easy. The candidate names are more tricky to match but it is a small universe inside a constituency. The script matched 99%+ of all candidates and we did the last few by hand. Now we had a an id from the result table (resultid) matched to each row in the expenditure table (id).
4. Exported both tables back to CSV. The problem with SQLite is that if you import from a CSV it treats all columns as text, so we had to...
5. Write some scripts (`process_exp.js` and `process_res.js`) to import CSVs into SQLite while retaining data types.
6. So you end up with two tables in a Sqlite database file (`votecost.sqlite`).

## The back end

The backend is hosted in AWS. It is basically a Lambda function that has SQLite database inside it. NodeJS supports SQLite, so we just had to bundle the SQLite file into the Lambda function. Since the file itself is small and the dataset is static, this is the simplest way to make the data available. The Lambda function exposes an API that can be used by the front end.

The infrastructure is deployed using Terraform. The state is held in an s3 bucket. You need to change the name of the bucket in `main.tf` to one you own if you want to deploy to your AWS account.

## The front end

The front end is a one page website built on Vuejs and Vuetify.
It reads in a list of constituencies via the API mentioned above and presents these to the user in a dropdown.
Once a constituency is selected the API retrieves the candidate data for the constituency and presents it to the user in a table.


# In this fork
I make some modifications to the frontend so that you can select multiple constituencies for comparison. They automatically appear in different colours for easy distinction, but this can be made into a toggleable option.

