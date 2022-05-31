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

const getReviews = (params) => {

  let count = params.count || 5;
  let page = params.page || 1;
  let product_id = params.product_id;
  let sort = {};
  if (params.sort === 'newest') {
    sort.date = -1;
  }
  if (params.sort === 'helpful') {
    sort.helpfulness = -1;
  }
  return newReview.find(
    {product_id},
    {
      _id: false,
      product_id: false,
      __v: false
    }
  ).limit(count).sort(sort);
};

module.exports = {newReview, getReviews, saveReview};