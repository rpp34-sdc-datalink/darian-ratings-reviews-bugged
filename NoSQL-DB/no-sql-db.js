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
  ).limit(count).sort(sort);
};

const getAllReviews = (product_id) => {
  return newReview.find({product_id}, {
    _id: false,
    product_id: false,
    __v: false
  });
};

const postReview = (params) => {
  console.log(params);
  let product_id = params.product_id;
  let rating = params.rating;
  let summary = params.summary;
  let body = params.body;
  let recommended = params.recommended;
  let name = params.name;
  let date = Date.now();
  let email = params.email;
  let photos = params.photos;
  let characteristics = params.characteristics;
  return newReview.find({}).sort({review_id: -1}).limit(1)
    .then((results) => {
      let newId = results[0].review_id + 1;
      return newReview.find({product_id: `${product_id}`})
        .then((prod) => {
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
          console.log({dataToAdd})
          return newReview.create({
            review_id: results[0].review_id + 1,
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
        });
    })
    .catch((err) => {
      console.log('DB Post ERROR', err);
    })

};

module.exports = {newReview, etlSaveReview, getReviews, getAllReviews, postReview};