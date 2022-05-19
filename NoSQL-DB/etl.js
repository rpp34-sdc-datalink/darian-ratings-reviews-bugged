const {Schema, model, mongoose} = require('mongoose');
const {saveReview} = require('./no-sql-db.js');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { parse } = require("csv-parse");

const etlAsync = async (file, etl) => {
  fs.createReadStream(file)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
      // console.log(row);
      await new Promise((resolve) => {
        etl(row, resolve)
      })
      console.log(row)
    })
    .on("end", function () {
      console.log("finished");
    })
    .on("error", function (error) {
      console.log(error.message);
    });
}

const etlReviews = (csv, r) => {
  // let csvArr = csv.split('\n');
  // csvArr.shift();

  let review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness;
  let saveReviewPromises = [];

  // csv.forEach((data) => {
    // let firstLine = data.split(',');
    [review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness] = csv;
    // console.log({review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness})
    saveReviewPromises.push(saveReview({review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness}, 'reviews'))
    // })

  Promise.all(saveReviewPromises)
    .then(()=> {
      console.log('done')
      r();

      etlAsync(path.resolve(__dirname, '../SDC-app-data/csv-test/review-photos.csv'), etlReviewPhotos)
    //   fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/review-photos.csv'), 'utf8', (err, data) => {
    //     if (err) {
    //       console.log('err', err)
    //     } else {
    //       etlReviewPhotos(data)
    //     }
    //   });
    })
    // .catch((err) => {
    //   console.log('Add Reviews ERROR:', err)
    // })
}

const etlReviewPhotos = (csv, r) => {
  // let csvArr = csv.split('\n');
  // csvArr.shift();
  let id, review_id, url;
  let saveReviewPhotosPromises = [];

  // csv.forEach((photoData) => {
  //   let firstLine = photoData.split(',');
  //   [id, review_id, url] = firstLine;
    saveReviewPhotosPromises.push(saveReview({id, review_id, url}, 'reviewPhotos'))
  // })

  Promise.all(saveReviewPhotosPromises)
    .then(()=> {
      console.log('photo Done')
      r()
      /* SEPERATE THESE 2 BY CREATING A SEPERATE CHARACTERISTICS DOCUMENT!! */
      fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/characteristics.csv'), 'utf8', (err, nameData) => {
        if (err) {
          console.log('err', err)
        } else {
          fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-characteristics.csv'), 'utf8', (err, data) => {
            if (err) {
              console.log('err', err)
            } else {
              etlCharacteristics(data, nameData)
            }
          });
        }
      });
    })
    .catch((err) => {
      console.log('err', err)
    })
}

const etlCharacteristics = async (csvData, csvNameData) => {
  let csvNameDataArr = csvNameData.split('\n');
  csvNameDataArr.shift();

  let createNameMap = async (nameData) => {
    let shapedObj = {};
    nameData.forEach((item) => {
      let id, product_id, name
      let line = item.split(',');
      [id, product_id, name] = line;
      shapedObj[id] = name;
    });
    return shapedObj;
  }

  let nameMap = await createNameMap(csvNameDataArr)

  let csvDataArr = csvData.split('\n');
  csvDataArr.shift();
  let chars = {};
  let characteristicsPromiseArr = [];
  await csvDataArr.forEach((data) => {
    let id, characteristic_id, review_id, value;
    let line = data.split(',');
    [id, characteristic_id, review_id, value] = line;
    if (chars[review_id] !== undefined) {
      chars[review_id][nameMap[characteristic_id]] = {id, value}
    } else {
      chars[review_id] = {[nameMap[characteristic_id]]: {id, value}}
    }
    characteristicsPromiseArr.push(saveReview(chars[review_id], 'characteristics', review_id))
  })
  // console.log({nameMap})

  Promise.all(characteristicsPromiseArr)
    .then(() => {
      console.log('all saved')
    })
    .catch((err) => {
      console.log('err', err)
    })
}
// let reviewFileStream = fs.createReadStream(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv'), 'utf8');

// reviewFileStream.on('data', (chunk) => {
//   console.log(chunk)
//   etlReviews(chunk)
// })

// fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv'), 'utf8', (err, data) => {
//   if (err) {
//     console.log('Read Reveiws File ERROR:', err)
//   } else {
//     etlReviews(data)
//   }
// });

// const rl = readline.createInterface({
//   input: fs.createReadStream(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv')),
//   crlfDelay: Infinity
// });

//  rl.on('line', (line)=> {
//   console.log({line})
// })


etlAsync(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv'), etlReviews)

module.exports = {etlReviews, etlReviewPhotos, etlCharacteristics}

