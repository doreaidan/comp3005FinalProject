//Aidan Dore, 101158193
//ran into problems with synchronous and asynchronous code so the query outputs are not printing to the terminal in the user loops

//not implemented
//---------------------
//addbook() does not add publishers, their number and authors
//auto restock not implemented
//searchByBook() can not search by author
//syncronous and a-synchromous code is messing with query out to userloop making it not visable but they are working
//-user checkout
//-no admin bookstore stats
//-no user ordering
//-no admin ordering
//-remove books does work

//dependencies:
//nodejs, using windows installer
//pg node "npm install pg"
//prompt-sync "npm install prompt-syn"


var currUserName;//full if a user is logged in null if not
var adminUserName;//full if a admin is logged in null if not
var quit = 0;//0 for no quit, 1 for quit


const {Client} = require('pg');
const  client = new Client({//update info to connect to pg 
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "aidan1234",
    database: "bookstore"
});
client.connect();

const prompt = require('prompt-sync')({sigint: true});//for user input

//creates user and user billing shipping info using parameterized queries
async function registerUser(username, pass){
    const values = [username, pass];
    const newQuery = `
        INSERT INTO user_registered (username, pass)
        VALUES ($1, $2)`;
    client.query(newQuery, values, (err, res) => {
        if(!err){//no error adding user
            console.log("VALID REGISTRATION");
            const first_name = prompt('Enter First Name: ');
            const last_name = prompt('Enter Last Name: ');
            const user_address = prompt('Enter Address: ');
            const city = prompt('Enter City: ');
            const country = prompt('Enter Country: ');
            const province_state = prompt('Enter Province/State: ');
            const postal_code = prompt('Enter Postal Code: ');
        
            const billingValues = [username, first_name, last_name, user_address, city, country, province_state, postal_code];
            const billingQuery = `INSERT INTO shippingBilling 
                    (username, first_name, last_name, user_address, city, country, province_state, postal_code)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
            client.query(billingQuery, billingValues, (billingerr, billingres) => {
                if(!billingerr){//no error adding billing shipping
                    console.log(billingres.rows);
                }else{
                    console.log(billingerr.message);
                }
            });
        }else{
            console.log("INVALID REGISTRATION");
            console.log(err.message);//error
        }
    });
}

//logs user in, the current user is saved in var currUserName;
async function logIn(username, pass){
    const logVals = [username, pass];
    const logQuery = "SELECT username FROM user_registered WHERE username = '"+logVals[0]+"' AND pass = '"+logVals[1]+"';";
    const res = await client.query(logQuery);
    if(res.rows[0] != null){
        console.log("SUCCESSFUL LOGIN");
        currUserName = logVals[0];
    }else{
        console.log("INVALID LOGIN");

    }
}

//register admin similar to register users with no ibilling shipping info
async function adminRegister(username, pass){
    const values = [username, pass];
    //console.log("username: " + username);
    //console.log("pass: " + pass);
    const newQuery = `
        INSERT INTO admin_registered (username, pass)
        VALUES ($1, $2)`;
    client.query(newQuery, values, (err, res) => {
        if(!err){
            console.log("VALID REGISTRATION");
            console.log(res.rows);//error
        }else{
            console.log("INVALID REGISTRATION");
            console.log(err.message);//error
        }
    });
}

//logs admin in, the current admin is saved in var adminUserName;
async function adminLogIn(username, pass){
    const adminLogVals = [username, pass];
    const adminLogQuery = "SELECT username FROM admin_registered WHERE username = '"+adminLogVals[0]+"' AND pass = '"+adminLogVals[1]+"';";
    const res = await client.query(adminLogQuery);
    if(res.rows[0] != null){
        console.log("SUCCESSFUL LOGIN");
        adminUserName = adminLogVals[0];
    }else{
        console.log("INVALID LOGIN");

    }
}

//adds books but does not add publishers their phone# and authors
function addBook(ISBN, book_name, genre, page_num, price, quantity) {
    //check if book already exists in the db
    const checkVal = [ISBN];
    const checkQuery = `SELECT * 
                FROM book 
                WHERE ISBN = $1`;
    client.query(checkQuery, checkVal, (err, res) => {
        if(!err){//no error
            if(res.rows == ""){//book not found
                //ADDING NEW BOOK
                const addVal = [ISBN, book_name, genre, page_num, price, quantity];
                const addQuery = `INSERT INTO book (ISBN, book_name, genre, page_num, price, quantity)
                            VALUES ($1, $2, $3, $4, $5, $6)`;
                client.query(addQuery, addVal, (err, res) => {
                    if(!err){
                        //console.log("A");
                        console.log(res.rows);
                    }else{
                        //console.log("B");
                        console.log(err.message);
                    }
                });
            }else{//book found just update quantity
                //ADDING OLD BOOK
                const oldVal = [quantity, ISBN];
                const oldQuery = `UPDATE book
                            SET quantity = (quantity + $1) 
                            WHERE ISBN = $2`;
                client.query(oldQuery, oldVal, (err, res) => {
                    if(!err){
                        //console.log("A");
                        //console.log(res.rows);
                    }else{
                        //console.log("B");
                        console.log(err.message);
                    }
                });

            }  
        }else{
            console.log(err.message);
        }
    });
}

//works for all but search for author
async function searchByBook(searchBy, userSearch){
    let values = [userSearch];
    let newQuery = 'NULL';
    if(searchBy == 1){//name
        newQuery = `SELECT *
                    FROM book
                    WHERE book_name = $1;`;
    }else if(searchBy == 2){//author name
        newQuery = `SELECT *
                    FROM book
                    WHERE authors = $1;`;
    }else if(searchBy == 3){//ISBN
        newQuery = `SELECT *
                    FROM book
                    WHERE ISBN = $1;`;
    }else if(searchBy == 4){//genre
        newQuery = `SELECT *
                    FROM book
                    WHERE genre = $1;`;
    }//add one for each
    //console.log("goobie: ");
    await client.query(newQuery, values, (err, res) => {
        if(!err){
            if(res.rows == ""){
                console.log("SEARCH NOT FOUND");
            }else{
                console.log("SEARCH FOUND: ");
                console.log(res.rows);
            }
        }else{
            console.log(err.message);
        }
    });
}


async function addToCart(ISBN, quantity){//adds book to user cart
    //need to check if there is enough quantity and if the book exists
    const checkVal = [ISBN, quantity];//NOT DONE
    const checkQuery = `Select * 
                    From book Where
                    ISBN = $1 And quantity >= $2`;
    client.query(checkQuery, checkVal, (err, res) => {
        if(!err){
            console.log(res.rows);
            if(res.rows == ""){
                console.log("Can not add to cart")//no quatity or book
            }else{//enough to add to cart
                const addVal = [currUserName, ISBN, quantity];
                const addQuery = `INSERT INTO checkOutBasket (username, ISBN, quantity) VALUES ($1, $2, $3)`;
                client.query(addQuery, addVal, (err, res) => {
                    if(!err){
                        //console.log("A");
                        console.log(res.rows);
                    }else{
                        //console.log("B");
                        console.log(err.message);
                    }
                });
            }
        }else{//error
            console.log(err.message);
        }
    });
}



async function removeFromCart(ISBN, quantity){//works similarly to remove books
    //update quantity if there is enough
    const delValues = [currUserName, ISBN, quantity];//, searchISBN
    const delQuery = `UPDATE checkOutBasket
                SET quantity = (quantity - $3) 
                WHERE username = $1 AND ISBN = $2 AND quantity >= $3`;
    client.query(delQuery, delValues, (err, res) => {
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
    });

    //check if quantity is 0 if it is delete 
    const checkValues = [ISBN];
    const checkQuery = `DELETE FROM checkOutBasket WHERE ISBN = $1 AND quantity = 0;`;
    client.query(checkQuery, checkValues, (err, res) => {
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
    });
}

function checkOut(){
    //ask if they want to update billing/shipping info

    //give price total ask if they want to pay

    //empty cart if bought
}

//will be used to update billing shipping during user order
function updateBilling(first_name, last_name, user_address, city, country, province_state, postal_code){//need to test
    //currUserName
    const billingValues = [currUserName, first_name, last_name, user_address, city, country, province_state, postal_code];
    const billingQuery = `UPDATE shippingBilling
                    SET first_name = $2, last_name = $3, user_address = $4, 
                    city = $5, country = $6, province_state = $7, postal_code = $8,
                    WHERE username = $1;`;
    client.query(billingQuery, billingValues, (billingerr, billingres) => {
        if(!billingerr){
            console.log(billingres.rows);
        }else{
            console.log(billingerr.message);
        }
    });
}

//works, prints the order info corresponding to a ordernum
function trackShipping(orderNum){
    const trackValues = [username];
    const trackQuery = 'Select * from userOrder Where orderNum = $1;';
    client.query(trackQuery, trackValues, (err, res)=>{
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
        //client.end();
    });
}

function autoRestock(){

}

function giveStats(){

}

async function PrintCart(username){//prints user cart
    const cartValues = [username];
    const cartQuery = 'Select * from checkOutBasket Where username = $1;';
    client.query(cartQuery, cartValues, (err, res)=>{
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
        //client.end();
    });
}

async function PrintTracking(orderNum){//prints user order tracking
    const trackingValues = [orderNum];
    const trackingQuery = 'Select * from checkOutBasket Where username = $1;';
    client.query(trackingQuery, trackingValues, (err, res)=>{
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
        //client.end();
    });
}

function printAllUsers(){//prints all users
    client.query('Select * from user_registered', (err, res)=>{
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
        //client.end();
    });
}

function printAllAdmin(){//prints all admins
    client.query('Select * from admin_registered', (err, res)=>{
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
        //client.end();
    });
}

async function printAllBooks(){//prints all books
    client.query('Select * from book', (err, res)=>{
        if(!err){
            console.log("AAAAAAAAA");
            console.log(res.rows);
        }else{
            console.log("BBBBBBBB");
            console.log(err.message);
        }
        //client.end();
    });
}

//used by admin to remove book 
function removeBooks(num, searchISBN){
    const delValues = [num, searchISBN];//, searchISBN
    const delQuery = `UPDATE book
                SET quantity = (quantity - $1) 
                WHERE ISBN = $2 AND quantity >= $1`;
    client.query(delQuery, delValues, (err, res) => {
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
    });

    //check if quantity is 0 if it is delete 
    const checkValues = [searchISBN];
    const checkQuery = `DELETE FROM book WHERE ISBN = $1 AND quantity = 0;`;
    client.query(checkQuery, checkValues, (err, res) => {
        if(!err){
            console.log(res.rows);
        }else{
            console.log(err.message);
        }
    });
}


//not logged in loop
async function logInLoop(){
    while(currUserName == null && adminUserName == null && quit == 0){
        console.log("\nOPTIONS (input the number)");
        console.log("---------------");
        console.log("1. Login as normal user.");
        console.log("2. Register as normal user.");
        console.log("3. Login as admin user.");
        console.log("4. Search book store.");
        console.log("5. Quit.");
        const userRes = prompt('What is your choice?: ');
        if(userRes == 1){
            const usernameRes = prompt('Enter Username: ');
            const passRes = prompt('Enter Password: ');
            await logIn(usernameRes, passRes);
        }else if(userRes == 2){
            const usernameRes = prompt('Enter Unique Username: ');
            const passRes = prompt('Enter Password: ');
            await registerUser(usernameRes, passRes);
        }else if(userRes == 3){
            const usernameRes = prompt('Enter Username: ');
            const passRes = prompt('Enter Password: ');
            await adminLogIn(usernameRes, passRes);
        }else if(userRes == 4){
            console.log("\nSEARCH OPTIONS (input the number)");
            console.log("---------------");
            console.log("1. Search by Book Name.");
            console.log("2. Search by Author Name.");
            console.log("3. Search by ISBN.");
            console.log("4. Search by Genre.");
            const searchByRes = prompt('Enter Search Option: ');
            const searchTermRes = prompt('Enter Search Term: ');
            await searchByBook(searchByRes, searchTermRes);
        }else if(userRes == 5){
            quit = 1;
        }
    }
    
    main();
}

//logged in loop
async function userLoop(){
    while(currUserName != null && quit == 0){
        console.log("\nOPTIONS (input the number)");
        console.log("---------------");
        console.log("1. Search bookstore.");
        console.log("2. Add to cart.");
        console.log("3. Remove from cart.");
        console.log("4. Check cart.");
        console.log("5. Checkout.");
        console.log("6. Track order.");
        console.log("7. Quit.");
        const userRes = prompt('What is your choice?: ');
        if(userRes == 1){
            console.log("\nSEARCH OPTIONS (input the number)");
            console.log("---------------");
            console.log("1. Search by Book Name.");
            console.log("2. Search by Author Name.");
            console.log("3. Search by ISBN.");
            console.log("4. Search by Genre.");
            const searchByRes = prompt('Enter Search Option: ');
            const searchTermRes = prompt('Enter Search Term: ');
            await searchByBook(searchByRes, searchTermRes);
        }else if(userRes == 2){
            const isbnRes = prompt('Enter ISBN of a book to add to cart: ');
            const quanRes = prompt('Enter Quantity to add: ');
            await addToCart(isbnRes, quanRes);
        }else if(userRes == 3){
            const isbnRes = prompt('Enter ISBN of a book to remove from cart: ');
            const quanRes = prompt('Enter Quantity to remove: ');
            await removeFromCart(isbnRes, quanRes);
        }else if(userRes == 4){
            await PrintCart(currUserName);//not work in loop for some reason
        }else if(userRes == 5){

        }else if(userRes == 6){
            const trackingRes = prompt('Enter Tracking Number: ');
            await PrintTracking(trackingRes);
        }else if(userRes == 7){
            quit = 1;
        }
    }
    main();    
}

function adminLoop(){
    
}

async function main() {
    
    if(currUserName == null && adminUserName == null && quit == 0){
        await logInLoop(); 
    }else if(currUserName != null && quit == 0){
        await userLoop();
    }else if(adminUserName != null && quit == 0){
        adminLoop();
    }else{
        console.log("Good Bye!");
        client.end();//disconnects from db
    } 
}
  
if (require.main === module) {
    main();
}
