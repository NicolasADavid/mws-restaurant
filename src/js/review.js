import DBHelper from "./dbhelper";
import dbPromise from "./dbpromise";

/**
 * Creates html for a review
 * @param {} review 
 */
function createReviewHTML(review) {

  console.log("Create review HTML");

  const li = document.createElement('li');
  const name = document.createElement('p');

  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Clears review inputs. Used after a submit to prepare for more reviews.
 */
function clearForm() {
  console.log("Form clear");
  document.getElementById('name').value = "";
  document.getElementById('rating').selectedIndex = 0;
  document.getElementById('comments').value = "";
}

/**
 * 
 */
function validateAndGetData() {

  console.log("validate");
    
  const data = {};

  let name = document.getElementById('name');
  if (name.value === '') {
    name.focus();
    return;
  }
  data.name = name.value;

  const ratingSelect = document.getElementById('rating');
  const rating = ratingSelect.options[ratingSelect.selectedIndex].value;
  if (rating == "--") {
    ratingSelect.focus();
    return;
  }
  data.rating = Number(rating);

  let comments = document.getElementById('comments');
  if (comments.value === "") {
    comments.focus();
    return;
  }
  data.comments = comments.value;

  let restaurantId = document.getElementById('review').dataset.restaurantId;
  data.restaurant_id = Number(restaurantId);

  data.createdAt = new Date().toISOString();

  return data;
}

/**
 * 
 * @param {event} e 
 */
function handleSubmit(e) {

  console.log("Submit: ", e);

  e.preventDefault();
  const review = validateAndGetData();
  if (!review) return;

  console.log(review);

  const url = `${DBHelper.API_URL}/reviews/`;
  const POST = {
    method: 'POST',
    body: JSON.stringify(review)
  };

  // TODO: use Background Sync to sync data with API server
  return fetch(url, POST).then(response => {
    if (!response.ok) return Promise.reject("We couldn't post review to server.");
    return response.json();
  }).then(newNetworkReview => {
    // save new review on idb
    dbPromise.putReviews(newNetworkReview);
    // post new review on page
    const reviewList = document.getElementById('reviews-list');
    const review = createReviewHTML(newNetworkReview);
    reviewList.appendChild(review);
    // clear form
    clearForm();
  })
  .catch((err) => {
    console.log(err);
  });

}

// Create a review
export default function review(restaurantId) {

  console.log("Create review for: ", restaurantId);

  // Body of the form
  const form = document.createElement('form');
  form.id = "review";
  // Form data
  form.dataset.restaurantId = restaurantId;

  let p = document.createElement('p');
  const name = document.createElement('input');

  // Name
  name.id = "name"
  name.setAttribute('type', 'text');
  name.setAttribute('aria-label', 'Name');
  name.setAttribute('placeholder', 'Enter Your Name');
  p.appendChild(name);
  form.appendChild(p);

  // Rating label
  p = document.createElement('p');
  const selectLabel = document.createElement('label');
  selectLabel.setAttribute('for', 'rating');
  selectLabel.innerText = "Rating: ";
  p.appendChild(selectLabel);

  // Rating control
  const select = document.createElement('select');
  select.id = "rating";
  select.name = "rating";
  select.classList.add('rating');

  // Rating options
  ["--", 1,2,3,4,5].forEach(number => {
    const option = document.createElement('option');
    option.value = number;
    option.innerHTML = number;
    if (number === "--") option.selected = true;
    select.appendChild(option);
  });
  p.appendChild(select);
  form.appendChild(p);

  // Review text input
  p = document.createElement('p');
  const textarea = document.createElement('textarea');
  textarea.id = "comments";
  textarea.setAttribute('aria-label', 'comments');
  textarea.setAttribute('placeholder', 'Enter your review');
  textarea.setAttribute('rows', '10');
  p.appendChild(textarea);
  form.appendChild(p);

  // Submit control
  p = document.createElement('p');
  const addButton = document.createElement('button');
  addButton.setAttribute('type', 'submit');
  addButton.setAttribute('aria-label', 'Add Review');
  addButton.classList.add('add-review');
  addButton.innerHTML = "Submit";
  p.appendChild(addButton);
  form.appendChild(p);
  form.onsubmit = handleSubmit;

  return form;
};