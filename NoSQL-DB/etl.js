const {Schema, model, mongoose} = require('mongoose');
const {etlSaveReview, newReview} = require('./no-sql-db.js');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const { parse } = require("csv-parse");



const etlReviews = (csv, next) => {
    etlSaveReview(csv, 'reviews')
      .then(()=> {
        console.log('Review Saved')
        next()
      })
      .catch((err) => {
        console.log('etlReviews ERROR:', err)
      })
}

const etlReviewPhotos = (csv, next) => {
  etlSaveReview(csv, 'reviewPhotos')
    .then(()=> {
      console.log('Photo Saved')
      next()
    })
    .catch((err) => {
      console.log('etlReviewPhotos ERROR:', err)
    })
}

const etlCharacteristics = (csv, next) => {
    etlSaveReview(csv, 'characteristics')
      .then(() => {
        console.log('Characteritcs Saved')
        next()
      })
      .catch((err) => {
        console.log('etlCharacteristics ERROR:', err)
      })

}


let allChars = {}
const etlAsync = async (file, etl, type) => {
  let num = 0;
  let dataToAdd = [];
  const stream = fs.createReadStream(file)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
      if (type === 'reviews') {
        let review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness;
        [review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness] = row;
        if (response === 'null') {
          response = '';
        }
        dataToAdd.push({review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness});
      }

      if (type === 'char') {
        let id, product_id, name;
        [id, product_id, name] = row;
        allChars[id] = name;
      }

      if (type === 'photo') {
        let id, review_id, url;
        [id, review_id, url] = row;
        id = +id;
        let photo = {id, url};
        stream.pause()
        let rev = await newReview.findOne({review_id});
        if (rev !== null) {
          rev.photos.addToSet(photo);
          dataToAdd.push(rev);
        }
        stream.resume()
      }

      if (type === 'rev-char') {
        let chars = {};
        let id, characteristic_id, review_id, value;
        [id, characteristic_id, review_id, value] = row;
        let charName = allChars[characteristic_id];
        let name = `characteristics.${charName}`;
        chars = {[charName]: {id, value}, name: charName}
        let data = {
          updateOne: {
            filter: {review_id: review_id},
            update: {
              $set: {
                [name]: chars[chars.name]
              }}
          }
        }
        dataToAdd.push(data)
      }

      if (dataToAdd.length >= 10000) {
        try {
          stream.pause();
          await new Promise((resolve) => {
            etl(dataToAdd, resolve)
          })
          num += 10000;
        } finally {
          console.log(`Saved ${num} lines`);
          dataToAdd = [];
          stream.resume()
        }
      }
    })
    .on("end", async function () {
      if (dataToAdd.length > 0) {
        await new Promise((resolve) => {
          etl(dataToAdd, resolve)
        })
        console.log('*************************************************************')
        console.log('*************************************************************')
        console.log('******************* FULL FILE SAVED TO DB *******************')
        console.log(`*********${num + dataToAdd.length} TOTAL Lines Saved*********`)
        console.log('*************************************************************')
        console.log('*************************************************************')
        num = 0;
        dataToAdd = [];
      }
      if (type === 'reviews') {
        console.log("******Reviews Finished******");
        let csvFile = path.resolve(__dirname, '../../SDC-app-data/csv-data/characteristics.csv')
        etlAsync(csvFile, 'noFuncitonNeeded', 'char')
      }
      if (type === 'char') {
        console.log('******Characteristics Finished******')
        let csvFile = path.resolve(__dirname, '../../SDC-app-data/csv-data/reviews_photos.csv')
        etlAsync(csvFile, etlReviewPhotos, 'photo')
      }
      if(type === 'photo') {
        console.log('******Photos Finished******')
        let csvFile = path.resolve(__dirname, '../../SDC-app-data/csv-data/characteristic_reviews.csv')
        etlAsync(csvFile, etlCharacteristics, 'rev-char')
      }
      if(type === 'rev-char') {
        allChars = {};
        console.log('******All Finished******');
        return;
      }
    })
    .on("error", function (error) {
      console.log(error.message);
    });
}

etlAsync(path.resolve(__dirname, '../../SDC-app-data/csv-data/reviews.csv'), etlReviews, 'reviews');