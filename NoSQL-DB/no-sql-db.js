const {Schema, model, mongoose} = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sdc-database')
  .then(() => {
    console.log('Connected to SDC Database!')
  })
  .catch((err) => {
    console.log('Connect to DB Error:', err);
  })
/*
REVIEW_PHOTOS
id,review_id,url
1,5,"https://images.unsplash.com/photo-1560570803-7474c0f9af99?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80"
2,5,"https://images.unsplash.com/photo-1561693532-9ff59442a7db?ixlib=rb-1.2.1&auto=format&fit=crop&w=975&q=80"

-------------------------

CHARACTERISTICS
id,characteristic_id,review_id,value
1,1,1,4
2,2,1,3

-----------------

REVIEWS
id,product_id,rating,date,summary,body,recommend,reported,reviewer_name,reviewer_email,response,helpfulness
1,1,5,1596080481467,"This product was great!","I really did or did not like this product based on whether it was sustainably sourced.  Then I found out that its made from nothing at all.",true,false,"funtime","first.last@gmail.com",null,8
2,1,4,1610178433963,"This product was ok!","I really did not like this product solely because I am tiny and do not fit into it.",false,false,"mymainstreammother","first.last@gmail.com",null,2

*/

const Review = new Schema({
  product_id: String,//good
  review_id: Number,
  summary: String,//good
  recommend: Boolean,//good
  reported: Boolean, //good
  response: String, //good
  body: String,//good
  date: String,//good
  reviewer_name: String,//good
  helpfulness: Number,//good
  // photos: [{type: mongoose.Types.ObjectId, ref: 'photo'}]
  photos: [Object],
  rating: Number,
  recommend: Boolean
});

const newReview = mongoose.model('newReview', Review);

// const photo = new Schema({
//   id: Number,//goood
//   url: String,//good
//   review_id: {type: mongoose.Types.ObjectId, ref: 'review'}
// });

const oneCharacteristic = new Schema({
  id: Number,//good
  name: String,//good
  value: String,//get all vals by using char id and searching in rev-char join table. get avg and write to val
  review_id: {type: mongoose.Types.ObjectId, ref: 'review'}
});

const characteristics = new Schema({
  // characteristics: [{type: mongoose.Types.ObjectId, ref: 'oneCharacteristic'}]

    review_id: Number,

    Fit: {
      id: Number,
      value: Number,
      votes: Number
    },
    Length: {
      id: Number,
      value: Number,
      votes: Number
    },
    Comfort: {
      id: Number,
      value: Number,
      votes: Number
    },
    Quality: {
      id: Number,
      value: Number,
      votes: Number
    },
    Size: {
      id: Number,
      value: Number,
      votes: Number
    },
    Width: {
      id: Number,
      value: Number,
      votes: Number
    }
});

const saveReview = (data, dataType) => {
  if (dataType === 'reviews') {
    return newReview.updateOne({review_id: data.review_id}, data, {upsert: true});
  }
  if (dataType === 'reviewPhotos') {
    let photo = {url: data.url, id: data.id};
    return newReview.findOneAndUpdate({review_id: data.review_id}, {$addToSet: { photos: photo}});
  }
};

module.exports = {newReview, characteristics, Review, saveReview}


// const test = new testReview({
//   product_id: '64620',
//   review_id: 1135537,
//   summary: 'good product?',
//   recommend: true,
//   response: null,
//   body: 'it may be good i do not know, this is only a test and the product isnt real',
//   date: '2022-02-12T00:00:00.000Z',
//   reviewer_name: 'joe',
//   helpfulness: 37,
//   photos: []
// });

// test.save()
//   .then(() => {
//     console.log('saved to DB')
//   })
//   .catch((err) => {
//     console.log('err', err)
//   })