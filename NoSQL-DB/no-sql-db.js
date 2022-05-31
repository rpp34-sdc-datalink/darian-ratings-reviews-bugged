const {Schema, model, mongoose} = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sdc-database')
  .then(() => {
    console.log('Connected to SDC Database!');
  })
  .catch((err) => {
    console.log('Connect to DB Error:', err);
  });

const Review = new Schema({
  product_id: String,
  review_id: {type: Number, index: true, unique: true},
  summary: String,
  recommend: Boolean,
  reported: Boolean,
  response: String,
  body: String,
  date: String,
  reviewer_name: String,
  helpfulness: Number,
  photos: [Object],
  rating: Number,
  recommend: Boolean,
  characteristics: {type: Object, default: {}}
});

const newReview = mongoose.model('newReview', Review);

const saveReview = (data, dataType, review_id) => {
  if (dataType === 'reviews') {
    return newReview.insertMany(data);
  }
  if (dataType === 'reviewPhotos') {
    let photo = {url: data.url, id: data.id};
    return newReview.bulkSave(data);
  }
  if (dataType === 'characteristics') {
    return newReview.bulkWrite(data);
  }
};

module.exports = {newReview, Review, saveReview};