const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter a description'],
      trim: true,
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please enter the address'],
      trim: true,
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please enter a type'],
      trim: true,
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter a price'],
      min: [0, 'Price cannot be less than 0'],
    },
    location: {
      type: String,
      required: [true, 'Please enter a location'],
      trim: true,
      maxlength: [100, 'Location cannot be more than 100 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please enter an image URL'],
      trim: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please specify an agent'],
    },
    interestedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);
