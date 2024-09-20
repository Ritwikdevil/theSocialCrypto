const connection=require("../database/db")

 //pagination api that is used for lazy load (load data while scrolling the page)

//with type [type=1 means tweets type =2 Replies] fetching  the userdata  of the category cryptogods:-
const getsCryptoGodsUrl = async (req, res) => {
  try {
    const username = req.query.username;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    // const type = parseInt(req.query.type);

    if (!username) {
      return res.status(400).json({ msg: 'Username parameter is required' });
    }

    let countQuery = 'SELECT COUNT(*) AS total FROM tweet_table WHERE categoryId = 1 AND username = ?';
    let selectQuery = 'SELECT * FROM tweet_table WHERE categoryId = 1 AND username = ?';

    // if (type === 1 || type === 2) {
    //   countQuery = `SELECT COUNT(*) AS total FROM tweet_table WHERE type = ${type} AND username = ?`;
    //   selectQuery = `SELECT * FROM tweet_table WHERE type = ${type} AND username = ?`;
    // }

    connection.query(countQuery, [username], async (error, countResults) => {
      if (error) {
        return res.status(500).json({ msg: 'Error fetching count data', error: error.message });
      }

      const totalDocuments = countResults[0].total;
      const totalPages = Math.ceil(totalDocuments / limit);
      const offset = (page - 1) * limit;

      selectQuery += ' ORDER BY tweetID DESC LIMIT ? OFFSET ?';

      connection.query(selectQuery, [username, limit, offset], async (error, results) => {
        if (error) {
          return res.status(500).json({ msg: 'Error fetching data', error: error.message });
        }

        const twitterUrls = results.map(item => `https://twitter.com${item.url}`);

        return res.status(200).json({
          urls: twitterUrls,
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalDocuments,
        });
      });
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Error', error: err.message });
  }
};

// only for dynamically fetching the submenu
const getmenu=((req, res) => {
  const query = 'SELECT username,categoryId	  FROM user_table';

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    
    // Respond with the retrieved data
    res.json(results);
  });
});

// for  dynamically fetching Manu & Submenu
const getHeading=((req,res)=>{
const query ='SELECT id,type, parentID,name FROM category_table';
// Execute the query
connection.query(query, (err, results) => {
  if (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ error: 'Database error' });
    return;
  }
  // Respond with the retrieved data
  res.json(results);
});

 })


  
  module.exports={getsCryptoGodsUrl,getmenu,getHeading}