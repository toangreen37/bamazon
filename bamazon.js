// all our require is listed here
const mysql = require("mysql");
const inquirer = require("inquirer");

// our connection to mysql 
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});


// Acctually connect to mysql server/database
connection.connect(function(err) {
    if (err) throw err;
    // Run the start function after connection is made. 
    start();
});

function start() {
    inquirer 
    // prompt the user to select an item and how many
        .prompt([
            {
                name: "ID",
                type: "input",
                message: "What is the ID of the product you would like to purchase?" 
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like to purchase?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false; 
                }
            }
        ])
        .then(function(answer) {
            console.log('Customer has selected: \n    item_id = '  + answer.ID + '\n    quantity = ' + answer.quantity);
        
            const item = answer.ID;
            const quantity = answer.quantity;

            const querySearch = "SELECT * FROM products WHERE ?";

            connection.query(querySearch, {item_id: item}, function(err, data) {
                if (err) throw err; 

                // console.log("data = " + JSON.stringify(data)); 

                // Checking to make sure valid item ID, if valid, place order. 
                if (data.length === 0) {
                    console.log("Error Please select a valid ITEM ID."); 
                    displayInventory(); 
                } else {
                    const productData = data[0];
                    if (quantity <= productData.stock_quantity) {
                        console.log("product is in stock! Order placed");

                        // Update the inventory after order placed
                        const updateQuery = "UPDATE products SET stock_quantity = " + (productData.stock_quantity - quantity) + " WHERE item_id = " + item;
                        // console.log("updateQuery = " + updateQuery);

                        connection.query(updateQuery, function(err, data) {
                            if (err) throw err;

                            console.log("Thank you for shopping at bamazon!");

                            //end connection
                            connection.end();
                        })
                    } else {
                        console.log("Sorry that product is out of stock, order cannot be placed");
                    } 
                }

            })

        }); 
    }

    function displayInventory() {
        query = "SELECT * FROM products";

        connection.query(query, function(err, data) {
            if (err) throw err;
            
            console.log("EXisting Inventory: ");
            console.log("---------------------\n");

            var inventory = "";
            for (var i = 0; i < data.length; i++) {
                inventory = ""; 
                inventory += "Item ID: " + data[i].item_id + "| "; 
                inventory += 'Product Name: ' + data[i].product_name + "| ";
                inventory += "Department: " + data[i].department_name + "| ";
                inventory += "Price: $" + data[i].price; 
                console.log(inventory); 
            }
        }

    )}