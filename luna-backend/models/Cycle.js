const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
 
    /* startDate is REQUIRED — a cycle must have a start date.
       'required: true' is MongoDB's version of NOT NULL.       */
    startDate: {
      type:     String,
      required: [true, 'startDate is required']
    },
    
    /* endDate is optional — the period might still be ongoing. */
    endDate: {
      type:    String,
      default: null
    },
 
    /* flow must be one of these exact values (or null).
       'enum' is MongoDB's version of a CHECK constraint.       */
    flow: {
      type: String,
      enum: {
        values:  [null, 'spotting', 'light', 'medium', 'heavy'],
        message: 'flow must be spotting, light, medium, or heavy'
      },
      default: null
    },
 
    cramps: {
      type: String,
      enum: {
        values:  [null, 'none', 'mild', 'moderate', 'severe'],
        message: 'cramps must be none, mild, moderate, or severe'
      },
      default: null
    },
 
    mood: {
      type: String,
      enum: {
        values:  [null, 'happy', 'neutral', 'sad', 'anxious', 'irritable'],
        message: 'mood must be one of the allowed values'
      },
      default: null
    },
 
    notes: {
      type:    String,
      default: ''
    }
  },
   { timestamps: true }
 
);

const Cycle = mongoose.model('Cycle', cycleSchema);
 
module.exports = Cycle;