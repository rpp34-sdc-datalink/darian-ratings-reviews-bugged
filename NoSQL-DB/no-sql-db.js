const {Schema, model, mongoose} = require('mongoose');
const { v4: uuidv4 } = require('uuid');

mongoose.connect('mongodb://localhost:27017/sdc-database')
  .then(() => {
    console.log('Connected to SDC Database!');
  })
  .catch((err) => {
    console.log('Connect to DB Error:', err);
  });

const Review = new Schema({
  product_id: String,
  review_id: {type: String || Number, index: true, unique: true},
  summary: String,
  recommend: Boolean,
  reported: {type: Boolean, default: false},
  response: {type: String, default: ''},
  body: String,
  date: String,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: {type: Number, default: 0},
  photos: [Object],
  rating: Number,
  recommend: Boolean,
  characteristics: {type: Object, default: {}}
});

const newReview = mongoose.model('newReview', Review);

const etlSaveReview = (data, dataType, review_id) => {
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
      __v: false,
      characteristics: false
    }
  ).limit(count).sort(sort)
    .catch((err) => {
      console.log('hiii')
      if (err.message === 'Product Does Not Exist') {
        return 'This product does not exist.';
      } else {
        throw err;
      }
    });
};

const getAllReviews = (product_id) => {
  return newReview.find({product_id}, {
    _id: false,
    product_id: false,
    __v: false
  })
    .catch((err) => {
      throw err;
    });
};

const postReview = (params) => {
  let product_id, rating, summary, body, recommended, name, email, photos, characteristics;
  ({product_id, rating, summary, body, recommended, name, email, photos, characteristics} = params);
  let date = Date.now();

  return newReview.find({product_id: `${product_id}`}).limit(-1)
    .then((prod) => {
      if (prod.length === 0) {
        throw new Error('Product Does Not Exist');
      }
      let chars = prod[0].characteristics;
      let charsObj = {};
      for (let key in chars) {
        let id = chars[key].id;
        charsObj[key] = {id: id, value: characteristics[id]};
      }

      let photosArray = [];
      for (let i = 0; i < photos.length; i++) {
        photosArray.push({id: i, url: photos[i]});
      }
      return {c: charsObj, p: photosArray};
    })
    .then((dataToAdd) => {
      let allPhotos = dataToAdd.p;
      let allChars = dataToAdd.c;
      return newReview.create({
        review_id: uuidv4(),
        product_id,
        rating,
        summary,
        body,
        date,
        recommend: recommended,
        reviewer_name: name,
        reviewer_email: email,
        photos: allPhotos,
        characteristics: allChars
      });
    })
    .catch((err) => {
      console.log(err.message);
      if (err.message === 'Product Does Not Exist') {
        return 'This product does not exist.';
      } else {
        throw err;
      }

    });
};

const helpful = (review_id) => {
  return newReview.updateOne({review_id}, {$inc: {helpfulness: 1}});
};

const report = (review_id) => {
  return newReview.updateOne({review_id}, {reported: true});
};

const deleteReview = (review_id) => {
  return newReview.deleteOne({review_id});
};

module.exports = {newReview, etlSaveReview, getReviews, getAllReviews, postReview, report, deleteReview, helpful};