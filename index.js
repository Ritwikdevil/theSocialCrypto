const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const cron = require('node-cron');
require('dotenv').config();
const route=require("./route/route")
const connection=require("./database/db")

const path =require("path")
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use("/", route);
const port = process.env.PORT;
app.use(express.static(path.join(__dirname,'views')));
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"views","index.html"))
})

const nitterBaseUrls = [
  'https://nitter.privacydev.net/',
  'https://nitter.salastil.com/',
  'https://nitter.cz/',
  'https://nitter.net/',
  'https://nitter.d420.de/',
];

const fetchDataAndSave = async () => {
  try {
    const currentDate = new Date().toISOString().slice(0, 10);
    console.log(currentDate);

    const allLinks = [];

    const fetchUsernamesQuery = 'SELECT username FROM user_table';
    connection.query(fetchUsernamesQuery, async (fetchError, fetchResults) => {
      if (fetchError) {
        console.error('Error fetching usernames:', fetchError);
        return;
      }

      const usernames = fetchResults.map(row => row.username);
      const twstalkerUrls = usernames.map(username => `https://twstalker.com/${username}`);

      const scrapeLinks = async (username, isTwstalker) => {
        const baseUrlList = isTwstalker ? ['https://twstalker.com/'] : nitterBaseUrls;
        for (const baseUrl of baseUrlList) {
          const url = `${baseUrl}${username}`;

          try {
            const response = await axios.get(url);
            if (response.status !== 200) {
              throw new Error('Error fetching data');
            }

            const html = response.data;
            const $ = cheerio.load(html);

            const links = [];

            // Logic for nitter URLs and twstalker URLs
            if (!isTwstalker) {
              const timelineItems = $(".timeline-item");
              timelineItems.each((index, element) => {
                const href = $(element).find("a").attr("href");
                if (href) {
                  let h = href.replace(/#m/, "");
                  links.push(h);
                }
              });
            } else {
              $('h4').each((index, h4Element) => {
                const nextSpan = $(h4Element).next('span');
                if (nextSpan.length > 0) {
                  const spanLinks = nextSpan.find('a[href]').map((index, linkElement) => {
                    return $(linkElement).attr('href');
                  }).get();
                  links.push(...spanLinks);
                }
              });
            }

            if (links.length > 0) {
              allLinks.push({ url, links });

              const getUserQuery = 'SELECT categoryId, id AS userId FROM user_table WHERE username = ?';
              connection.query(getUserQuery, [username], async (getUserError, userResults) => {
                if (getUserError) {
                  console.error('Error fetching userId:', getUserError);
                }

                let categoryId = null;
                let userId = null;
                if (userResults && userResults.length > 0) {
                  categoryId = userResults[0].categoryId;
                  userId = userResults[0].userId;
                }

                // Insert into database
                for (const link of links) {
                  const tweetID = link.split('/').pop();
                  const cleanUrl = isTwstalker ? link : link.replace(baseUrl, '');
                  const data = {
                    username,
                    type: link.includes(username) ? 1 : 2,
                    url: cleanUrl,
                    tweetID,
                    userId,
                    categoryId
                  };

                  const insertQuery = 'INSERT INTO tweet_table (username, type, url, tweetID, userId, categoryId) VALUES (?, ?, ?, ?, ?, ?)';
                  connection.query(insertQuery, [data.username, data.type, data.url, data.tweetID, data.userId, data.categoryId], (error, results) => {
                    if (error) {
                      if (error.code === 'ER_DUP_ENTRY') {
                        console.log('Duplicate URL, skipping:', data.url);
                      } else {
                        console.error('Error saving in DB:', error);
                      }
                    } else {
                      console.log('Saved in DB:', data);
                    }
                  });
                }
              });

              break;
            } else {
              console.log(`No data found on ${url}, moving to the next URL.`);
            }
          } catch (error) {
            console.error('Error scraping URL:', url, error.message);
          }
        }
      };

      const nitterScrapePromises = usernames.map(username => scrapeLinks(username, false));
      const twstalkerScrapePromises = usernames.map(username => scrapeLinks(username, true));

      await Promise.all([...nitterScrapePromises, ...twstalkerScrapePromises]);

      console.log('Scraping completed.');
    });

  } catch (error) {
    console.error('Overall error:', error.message);
  }
};


// cron.schedule('*/1 * * * *', fetchDataAndSave);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
