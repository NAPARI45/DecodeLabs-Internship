const express = require('express');
const router  = express.Router();

let cycles =[];
let nextId = 1;

function validateCycle(data) {
    const errors = [];

    if (!data.startDate) {
        errors.push('Start date is required');
    }


    if(data.startDate && isNaN(new Date(data.startDate).getTime())) {
        errors.push('Start date must be a valid date (e.g. 2026-05-01)');
    }

    if (!data.endDate && isNaN(new Date(data.endDate).getTime())) {
        errors.push('End date must be a valid date if provided');
    }

    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end < start) {
            errors.push('End date cannot be before start date');
        }
    }

    const validFlow = ['spotting', 'light', 'medium', 'heavy'];
    if (data.flow && !validFlow.includes(data.flow)) {
        errors.push(`Flow must be one of: ${validFlow.join(', ')}`);
    
    }

    const validCramps = ['none', 'mild', 'moderate', 'severe'];
    if (data.cramps && !validCramps.includes(data.cramps)) {
        errors.push(`Cramps must be one of: ${validCramps.join(', ')}`);
    }

    const validMood = ['happy', 'neutral', 'sad', 'anxious' ,'irritable', ];
    if (data.mood && !validMood.includes(data.mood)) {
        errors.push(`Mood must be one of: ${validMood.join(', ')}`);
    }

    return errors;
}


router.get('/', (req, res) => {
 
  // Sort cycles newest first before returning
  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );
 
  // Send back all cycles + a count
  res.status(200).json({
    success: true,
    count:   sorted.length,
    cycles:  sorted
  });
 
});

router.get('/latest', (req, res) => {
 
  if (cycles.length === 0) {
    // No cycles logged yet — send 404
    return res.status(404).json({
      success: false,
      message: 'No cycles logged yet'
    });
  }
 
  // Sort by startDate and pick the most recent one
  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );
 
  res.status(200).json({
    success: true,
    cycle:   sorted[0]
  });
 
});
 

router.get('/:id', (req, res) => {
 
  // req.params.id comes in as a string ("3"), so we
  // convert it to a number with parseInt for comparison
  const id    = parseInt(req.params.id);
  const cycle = cycles.find(c => c.id === id);
 
  if (!cycle) {
    // Cycle with that ID doesn't exist
    return res.status(404).json({
      success: false,
      message: `No cycle found with id ${id}`
    });
  }
 
  res.status(200).json({
    success: true,
    cycle:   cycle
  });
 
});


router.post('/', (req, res) => {

    const { startDate, endDate, flow, cramps, mood, notes } = req.body;
    const errors = validateCycle(req.body);
 
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors   // send back exactly what was wrong
    });
  }
    const existingIndex = cycles.findIndex(c => c.startDate === startDate);
 
  if (existingIndex >= 0) {
    // Update the existing entry
    cycles[existingIndex] = {
      ...cycles[existingIndex],  // keep existing fields (like id)
      startDate,
      endDate:  endDate  || null,
      flow:     flow     || null,
      cramps:   cramps   || null,
      mood:     mood     || null,
      notes:    notes    || ''
    };
 
    return res.status(200).json({
      success: true,
      message: 'Cycle updated',
      cycle:   cycles[existingIndex]
    });
  }
  const newCycle = {
    id:        nextId++,
    startDate,
    endDate:   endDate  || null,
    flow:      flow     || null,
    cramps:    cramps   || null,
    mood:      mood     || null,
    notes:     notes    || '',
    createdAt: new Date().toISOString()  // timestamp of when it was logged
  };
 
  /* ── Step E: Save it and respond ──────────────────────────
     Push it into our cycles array, then send back
     status 201 (Created) with the new cycle object.
  ────────────────────────────────────────────────────────── */
  cycles.push(newCycle);
 
  res.status(201).json({
    success: true,
    message: 'Cycle logged successfully',
    cycle:   newCycle
  });
 
});
 
 
/* ============================================================
   ENDPOINT 5: DELETE /cycles/:id
   
   What it does: Removes a cycle entry by ID.
   Status code: 200 → success with confirmation message
   ============================================================ */
router.delete('/:id', (req, res) => {
 
  const id    = parseInt(req.params.id);
  const index = cycles.findIndex(c => c.id === id);
 
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `No cycle found with id ${id}`
    });
  }
 
  // Remove 1 item at position 'index'
  const deleted = cycles.splice(index, 1)[0];
 
  res.status(200).json({
    success: true,
    message: `Cycle ${id} deleted`,
    cycle:   deleted
  });
 
});
 
 
/* ── Export the router ───────────────────────────────────────
   This makes the router available to server.js.
   Without this line, server.js can't use it.
────────────────────────────────────────────────────────────── */
module.exports = router;