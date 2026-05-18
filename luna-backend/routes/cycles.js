const express = require('express');
const router  = express.Router();
const Cycle   = require('../models/Cycle');

/* ============================================================
   GET /cycles
   Returns all cycles, newest first.
   ============================================================ */
router.get('/', async (req, res) => {
  try {
    /* .find({}) → find ALL documents (empty filter = no conditions)
       .sort({ startDate: -1 }) → newest first (-1 = descending)   */
    const cycles = await Cycle.find({}).sort({ startDate: -1 });
 
    res.status(200).json({
      success: true,
      count:   cycles.length,
      cycles:  cycles
    });
 
  } catch (error) {
    /* If anything goes wrong with the database query,
       catch it here and return a 500 (server error)              */
    console.error('GET /cycles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cycles',
      error:   error.message
    });
  }
});
 
 
/* ============================================================
   GET /cycles/latest
   Returns only the most recent cycle.
   Used by the dashboard for predictions.
 
   IMPORTANT: This route must be ABOVE /:id below.
   Otherwise Express would treat "latest" as an ID.
   ============================================================ */
router.get('/latest', async (req, res) => {
  try {
    /* .findOne() returns a single document.
       .sort({ startDate: -1 }) gets the newest one.             */
    const cycle = await Cycle.findOne({}).sort({ startDate: -1 });
 
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: 'No cycles logged yet'
      });
    }
 
    res.status(200).json({
      success: true,
      cycle:   cycle
    });
 
  } catch (error) {
    console.error('GET /cycles/latest error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest cycle',
      error:   error.message
    });
  }
});
 
 
/* ============================================================
   GET /cycles/:id
   Returns one specific cycle by its MongoDB ID.
   ============================================================ */
router.get('/:id', async (req, res) => {
  try {
    /* MongoDB IDs look like: 664f3b2a1c4e5d6f7a8b9c0d
       findById() handles the lookup automatically.              */
    const cycle = await Cycle.findById(req.params.id);
 
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: `No cycle found with id ${req.params.id}`
      });
    }
 
    res.status(200).json({ success: true, cycle });
 
  } catch (error) {
    console.error('GET /cycles/:id error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cycle',
      error:   error.message
    });
  }
});
 
 
/* ============================================================
   POST /cycles
   Saves a new cycle to MongoDB.
 
   Mongoose validates the data against the schema automatically
   before saving — so we don't need our manual validateCycle()
   function from Project 2 anymore. The schema does it for us.
   ============================================================ */
router.post('/', async (req, res) => {
  try {
    const { startDate, endDate, flow, cramps, mood, notes } = req.body;
 
    /* Basic check — startDate is required */
    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate is required'
      });
    }
 
    /* Check if a cycle with this start date already exists.
       If so, update it rather than creating a duplicate.        */
    const existing = await Cycle.findOne({ startDate });
 
    if (existing) {
      /* Update the existing document.
         { new: true } means return the UPDATED document,
         not the old one.                                        */
      existing.endDate = endDate || null;
      existing.flow    = flow    || null;
      existing.cramps  = cramps  || null;
      existing.mood    = mood    || null;
      existing.notes   = notes   || '';
      await existing.save();
 
      return res.status(200).json({
        success: true,
        message: 'Cycle updated',
        cycle:   existing
      });
    }
 
    /* Create and save a brand new cycle document.
       Mongoose validates it against the schema first.
       If validation fails, it throws an error caught below.     */
    const newCycle = await Cycle.create({
      startDate,
      endDate: endDate || null,
      flow:    flow    || null,
      cramps:  cramps  || null,
      mood:    mood    || null,
      notes:   notes   || ''
    });
 
    /* 201 = Created — a new resource was successfully made      */
    res.status(201).json({
      success: true,
      message: 'Cycle logged successfully',
      cycle:   newCycle
    });
 
  } catch (error) {
    /* Mongoose validation errors have a specific structure.
       We check for them and return clear messages.              */
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors:  messages
      });
    }
 
    console.error('POST /cycles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to save cycle',
      error:   error.message
    });
  }
});
 
 
/* ============================================================
   DELETE /cycles/:id
   Removes a cycle by its MongoDB ID.
   ============================================================ */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Cycle.findByIdAndDelete(req.params.id);
 
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `No cycle found with id ${req.params.id}`
      });
    }
 
    res.status(200).json({
      success: true,
      message: 'Cycle deleted',
      cycle:   deleted
    });
 
  } catch (error) {
    console.error('DELETE /cycles/:id error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cycle',
      error:   error.message
    });
  }
});
 
 
module.exports = router;