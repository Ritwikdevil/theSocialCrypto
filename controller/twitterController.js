const connection=require("../database/db")

 //pagination api that is used for lazy load (load data while scrolling the page)

 //fetch all tweets with type [type=1 means tweets type =2 Replies] for home page
const geturl = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    // const type = parseInt(req.query.type); // Get the 'type' parameter from the query

    let countQuery = 'SELECT COUNT(*) AS total FROM tweet_table';
    let selectQuery = 'SELECT * FROM tweet_table';

    // if (type === 1 || type === 2) {
    //   countQuery = `SELECT COUNT(*) AS total FROM tweet_table WHERE type = ${type}`;
    //   selectQuery = `SELECT * FROM tweet_table WHERE type = ${type}`;
    // }

    connection.query(countQuery, async (error, countResults) => {
      if (error) {
        throw error;
      }

      const totalDocuments = countResults[0].total;
      const totalPages = Math.ceil(totalDocuments / limit);
      const offset = (page - 1) * limit;

      selectQuery += ' ORDER BY tweetID DESC LIMIT ? OFFSET ?';

      try {
        const results = await new Promise((resolve, reject) => {
          connection.query(selectQuery, [limit, offset], (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });

        const twitterUrls = results.map(item => `https://twitter.com${item.url}`);

        return res.status(200).json({
          urls: twitterUrls,
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalDocuments,
        });
      } catch (selectError) {
        return res.status(500).json({ msg: 'Error fetching data', error: selectError.message });
      }
    });
  } catch (err) {
    return res.status(500).json({ msg: 'Error', error: err.message });
  }
};



  module.exports={geturl}