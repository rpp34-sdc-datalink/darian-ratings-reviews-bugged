const {Schema, model, mongoose} = require('mongoose');
const {etlReviews, etlReviewPhotos, etlCharacteristics} = require('./etl.js');
const fs = require('fs');
const {newReview} = require('./no-sql-db.js');
const path = require('path');

describe('ETL Reviews', () => {
  it('Should Save Review Data to the DB in Correct Shape', (done) => {
    fs.readFile(path.resolve(__dirname, '../SDC-app-data/csv-test/reviews-test.csv'), 'utf8', (err, data) => {
      if (err) {
        console.log('err', err)
      } else {
        etlReviews(data)
      }
    });
    let d;
    newReview.find({review_id: 1})
      .then((data) => {
         console.log('TEST', data[0].characteristics['Fit'])
        expect(data[0].product_id).toEqual('1');
        expect(data[0].date).toEqual('1596080481467');
        expect(data[0].helpfulness).toEqual(8);
        expect(data[0].rating).toEqual(5);
        expect(data[0].reviewer_name).toEqual('"funtime"');
        expect(data[0].summary).toEqual('"This product was great!"');
        done()
      })
      .catch((err) => {
        console.log('err', err)
      })
  })
})