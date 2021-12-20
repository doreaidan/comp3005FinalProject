# comp3005FinalProject
Aidan Dore, 101158193
 HOW TO RUN:
  dependencies:
    -nodejs, using windows installer
    -pg node "npm install pg", for connecting to pg
    -prompt-sync "npm install prompt-syn", for user input

  To run: 
    -make sure all dependencies are installed
    -input bookstore.sql into pgadmin to create tables
    -cd to nodeBookstore.js location
    -inside the file nodeBookstore.js there is host, user, port, password, database info to update to connect to your specific pgadmin 
    -”node nodeBookstore.js” to run
    -follow instructions printed to console, although the query output is not printing currently because of issues with synchronous, and asynchronous code.
