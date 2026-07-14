const Submission = require('../models/Submission');
const Task = require('../models/Task');

// @desc  Submit a task with a file upload
// @route POST /api/submissions/:taskId
// @access Talent
const submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { notes } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: 'This task is not assigned to you' });
    }

    const allowedStatuses = ['Claimed', 'Submitted'];
    if (!allowedStatuses.includes(task.status)) {
      return res.status(400).json({ message: 'Task cannot be submitted in its current state' });
    }

    const fileUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : req.body.fileUrl || null;

    // Store each submission as a new record so previous uploads/notes are preserved
    const submission = await Submission.create({
      taskId,
      talentId: req.user._id,
      fileUrl,
      notes,
    });

    await Task.findByIdAndUpdate(taskId, { status: 'Submitted' });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get the latest submission for a specific task by the current user
// @route GET /api/submissions/:taskId
// @access Talent
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      taskId: req.params.taskId,
      talentId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this task' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get the latest submission for each task (Admin review queue)
// @route GET /api/submissions/admin/all
// @access Admin
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$taskId', latest: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$latest' } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'taskId',
        },
      },
      { $unwind: { path: '$taskId', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'talentId',
          foreignField: '_id',
          as: 'talentId',
        },
      },
      { $unwind: { path: '$talentId', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve or Reject a submission
// @route PUT /api/submissions/:id/review
// @access Admin
const reviewSubmission = async (req, res) => {
  const { reviewStatus } = req.body;

  if (!['Approved', 'Rejected'].includes(reviewStatus)) {
    return res.status(400).json({ message: 'Review status must be Approved or Rejected' });
  }

  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { reviewStatus },
      { new: true }
    )
      .populate('taskId', 'title status')
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.taskId && submission.taskId.status) {
      await Task.findByIdAndUpdate(submission.taskId._id, { status: reviewStatus });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitTask, getSubmission, getAllSubmissions, reviewSubmission };
