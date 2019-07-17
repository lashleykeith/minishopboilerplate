const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  bookName : String,
  phoneNumber : String,
  email : String,
  eventDateIn: String,
  eventDateOut: String,
  adults: String,
  children: String,
  notes : String,
  createdAt: String
}, { timestamps: true });


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
