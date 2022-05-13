const {Schema, model, mongoose} = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sdc-database')
  .then(() => {
    console.log('Connected to SDC Database!')
  })
  .catch((err) => {
    console.log('Connect to DB Error:', err);
  })


const reveiw = new Schema({
  product_id: String,
  reveiw_id: Number,
  summary: String,
  recommend: Boolean,
  response: String,
  body: String,
  date: String,
  reviewer_name: String,
  helpfulness: Number,
  photos: [{type: mongoose.Types.ObjectId, ref: 'photo'}]
});

const testReview = mongoose.model('testReview', reveiw);

const photo = new Schema({
  id: Number,
  url: String,
  reveiw_id: {type: mongoose.Types.ObjectId, ref: 'reveiw'}
});

const oneCharacteristic = new Schema({
  id: Number,
  name: String,
  value: String,
  reveiw_id: {type: mongoose.Types.ObjectId, ref: 'reveiw'}
});

const reviewMetaData = new Schema({
  ratings: {
    "1": String,
    "2": String,
    "3": String,
    "4": String,
    "5": String
  },
  recommend: {
    "false": String,
    "true:": String
  },
  characteristics: [{type: mongoose.Types.ObjectId, ref: 'oneCharacteristic'}]
});

const test = new testReview({
  product_id: '64620',
  reveiw_id: 1135537,
  summary: 'good product?',
  recommend: true,
  response: null,
  body: 'it may be good i do not know, this is only a test and the product isnt real',
  date: '2022-02-12T00:00:00.000Z',
  reviewer_name: 'joe',
  helpfulness: 37,
  photos: []
});

test.save()
  .then(() => {
    console.log('saved to DB')
  })
  .catch((err) => {
    console.log('err', err)
  })