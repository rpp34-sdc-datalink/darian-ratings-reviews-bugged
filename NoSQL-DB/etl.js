const {Schema, model, mongoose} = require('mongoose');
const {saveReview} = require('./no-sql-db.js');
const fs = require('fs');
const path = require('path');

const etlReviews = (csv) => {
  let csvArr = csv.split('\n');
  csvArr = csvArr.slice(1);

  let review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness;
  let saveReviewPromises = [];

  csvArr.forEach((data) => {
    let firstLine = data.split(',');
    [review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness] = firstLine;
    saveReviewPromises.push(saveReview({review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness}, 'reviews'))
    })

  Promise.all(saveReviewPromises)
    .then(()=> {
      fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/review-photos.csv'), 'utf8', (err, data) => {
        if (err) {
          console.log('err', err)
        } else {
          etlReviewPhotos(data)
        }
      });
    })
    .catch((err) => {
      console.log('err', err)
    })
}

const etlReviewPhotos = (csv) => {
  let csvArr = csv.split('\n');
  csvArr = csvArr.slice(1);
  let id, review_id, url;
  let saveReviewPhotosPromises = [];

  csvArr.forEach((photoData) => {
    let firstLine = photoData.split(',');
    [id, review_id, url] = firstLine;
    saveReviewPhotosPromises.push(saveReview({id, review_id, url}, 'reviewPhotos'))
  })

  Promise.all(saveReviewPhotosPromises)
    .then(()=> {
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
  csvNameDataArr = csvNameDataArr.slice(1);

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
  csvDataArr = csvDataArr.slice(1);
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
  console.log({nameMap})

  Promise.all(characteristicsPromiseArr)
    .then(() => {
      console.log('all saved')
    })
    .catch((err) => {
      console.log('err', err)
    })
}

fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv'), 'utf8', (err, data) => {
  if (err) {
    console.log('err', err)
  } else {
    etlReviews(data)
  }
});

// fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-data/reviews-photos.csv'), 'utf8', (err, data) => {
//   if (err) {
//     console.log('err', err)
//   } else {
//     etlReviewPhotos(data)
//   }
// });

// fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-data/characteristics.csv'), 'utf8', (err, nameData) => {
//   if (err) {
//     console.log('err', err)
//   } else {
//     fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-data/characteristics_reviews.csv'), 'utf8', (err, data) => {
//       if (err) {
//         console.log('err', err)
//       } else {
//         etlCharacteristics(data, nameData)
//       }
//     });
//   }
// });

module.exports = {etlReviews, etlReviewPhotos, etlCharacteristics}

