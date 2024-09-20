const connection=require('../database/db')
const jwt =require("jsonwebtoken")



const login=async(req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
  
    connection.query('SELECT * FROM admin WHERE username = ?', [username], (err, results) => {
      if(err) {
        return res.status(500).send('Server error.');
      }
  
      const user = results[0];
  
      if (!user) {
        return res.status(400).send('User not found.');
      }
  
      if (password !== user.password) { // Not using bcrypt means passwords are stored in plain text
        return res.status(400).send('Incorrect password.');
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).send({ token });
    })
}


const addUserDetails = (req, res) => {
    const { username, categoryName } = req.body;

    if (!username || !categoryName) {
        return res.status(400).send('Username and categoryName are required');
    }

    // Query to get the categoryId based on the categoryName
    const getCategoryQuery = 'SELECT id FROM category_table WHERE name = ?';
    
    connection.query(getCategoryQuery, [categoryName], (err, categoryResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error occurred while fetching category');
        }

        if (categoryResults.length === 0) {
            return res.status(404).send('Category not found');
        }

        const categoryId = categoryResults[0].id;

        // Insert query using the fetched categoryId
        const insertUserQuery = 'INSERT INTO user_table (username, categoryId) VALUES (?, ?)';
        connection.query(insertUserQuery, [username, categoryId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error occurred while adding user');
            }
            res.status(201).send(`User added with ID: ${result.insertId}`);
        });
    });
};



const getUser = async (req, res) => {
    try {
        // Updated query to perform a JOIN with the category_table
        const query = `
            SELECT user_table.*, category_table.name AS categoryName
            FROM user_table
            LEFT JOIN category_table ON user_table.categoryId = category_table.id
            WHERE user_table.status = 1;
        `;

        connection.query(query, (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const editUser = (req, res) => {
    const id = req.params.id;
    const { username, categoryName } = req.body;

    if (!username || !categoryName) {
        return res.status(400).send({ message: "Username and categoryName are required" });
    }

    // Query to get the categoryId based on the categoryName
    const getCategoryQuery = 'SELECT id FROM category_table WHERE name = ?';

    connection.query(getCategoryQuery, [categoryName], (err, categoryResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: err.message });
        }

        if (categoryResults.length === 0) {
            return res.status(404).send({ message: 'Category not found' });
        }

        const categoryId = categoryResults[0].id;

        // Update query using the fetched categoryId
        const updateQuery = 'UPDATE user_table SET username = ?, categoryId = ? WHERE id = ?';

        connection.query(updateQuery, [username, categoryId, id], (error, results) => {
            if (error) {
                return res.status(500).send({ message: error.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).send({ message: "User not found!" });
            }

            res.send({ message: 'User details updated successfully!' });
        });
    });
};



const DeleteUser = async (req, res) => {
    try {
        // Retrieve the ad ID from the URL parameters
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Ad ID is required for deletion" });
        }

        // Use a parameterized query for security against SQL injection
        const updateQuery = "UPDATE user_table SET status = ? WHERE id = ?";
        const statusValue = 2;

        connection.query(updateQuery, [statusValue, id], (error, result) => {
            if (error) {
                throw error;
            }

            // Check if any rows were affected (i.e., the ad exists and was updated)
            if (result.affectedRows > 0) {
                res.json({ message: "user details deleted successfully!" });
            } else {
                res.status(404).json({ error: "Ad not found" });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addCategory = (req, res) =>{
    const { type, parentID,name } = req.body;
  
    if (!type || !parentID || !name) {
      return res.status(400).send('type , parentID and name are required');
    }
  
    const query = 'INSERT INTO category_table (type, parentID,name) VALUES (?, ?,?)';
    connection.query(query, [type, parentID,name], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error occurred');
      }
      res.status(201).send(`Category added with ID: ${result.insertId}`);
    });

}

const getCategoryDetails = (req, res) =>{
    try {
        const query = "SELECT * FROM category_table WHERE status = 1"; // Add the WHERE clause

        connection.query(query, (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
   
}

const editCategory= (req, res) => {
    try {
        const id = req.params.id;
        const { type, parentID,name } = req.body;
    
        if (!type || !parentID || !name) {
            return res.status(400).send({ message: "Missing fields!" });
        }
    
        const query = `
            UPDATE category_table SET 	type = ?, parentID = ?, name = ? WHERE id = ?
        `;
    
        connection.query(query, [type, parentID, name,id], (error, results) => {
            if (error) {
                return res.status(500).send({ message: error.message });
            }
    
            if (results.affectedRows === 0) {
                return res.status(404).send({ message: "category not found!" });
            }
    
            res.send({ message: 'Category details updated successfully!' });
        });
        
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        // Retrieve the ad ID from the URL parameters
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Ad ID is required for deletion" });
        }

        // Use a parameterized query for security against SQL injection
        const updateQuery = "UPDATE category_table SET status = ? WHERE id = ?";
        const statusValue = 2;

        connection.query(updateQuery, [statusValue, id], (error, result) => {
            if (error) {
                throw error;
            }

            // Check if any rows were affected (i.e., the ad exists and was updated)
            if (result.affectedRows > 0) {
                res.json({ message: "category details deleted successfully!" });
            } else {
                res.status(404).json({ error: "category not found" });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getCategoryparentDetails = (req, res) => {
    try {
        // Updated query to include condition for parentID
        const query = "SELECT * FROM category_table WHERE parentID = 0 AND status = 1";

        connection.query(query, (err, results) => {
            if (err) {
                throw err;
            }
            res.json(results);
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



  module.exports={login,addUserDetails,getUser,editUser,DeleteUser,addCategory,getCategoryDetails,editCategory,deleteCategory,getCategoryparentDetails}

