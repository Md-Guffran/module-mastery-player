const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserAssessmentProgress = require('../models/UserAssessmentProgress');
const UserProgress = require('../models/UserProgress');
const Course = require('../models/Course');

// @route   POST api/assessments/submit
// @desc    Submit an assessment by a user
// @access  Private (User)
router.post('/submit', auth, async (req, res) => {
  const { courseId, dayId, submittedLink } = req.body;
  const userId = req.user.id;

  try {
    // Find the course and day to get assessment details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    let assessmentTitle = '';
    let assessmentLink = '';
    let found = false;

    for (const week of course.weeks) {
      for (const day of week.days) {
        if (day._id.toString() === dayId) {
          assessmentTitle = day.assessment;
          assessmentLink = day.assessmentLink;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found || !assessmentTitle || !assessmentLink) {
      return res.status(404).json({ msg: 'Exercise not found for the specified day' });
    }

    let userAssessment = await UserAssessmentProgress.findOneAndUpdate(
      { userId, courseId, dayId },
      {
        submittedLink,
        status: 'submitted',
        submissionDate: new Date(),
        assessmentTitle,
        assessmentLink,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(userAssessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/assessments/user
// @desc    Get all assessment progress for a user across all enrolled courses
// @access  Private (User)
// NOTE: This route must be defined BEFORE /user/:courseId to avoid route conflicts
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all assessments for the user
    const assessments = await UserAssessmentProgress.find({
      userId: userId,
    })
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });

    // Get all courses to find which ones have assessments
    const allCourses = await Course.find().populate({
      path: 'weeks.days.modules',
      model: 'Module'
    });

    // Find all assessments from courses the user has progress in (enrolled courses)
    const userProgress = await UserProgress.find({ user: userId });
    const enrolledCourseIds = new Set();
    
    // Find courses where user has progress (enrolled)
    userProgress.forEach(progress => {
      allCourses.forEach(course => {
        course.weeks.forEach(week => {
          week.days.forEach(day => {
            day.modules.forEach(module => {
              module.videos.forEach(video => {
                if (String(video._id) === String(progress.lessonId)) {
                  enrolledCourseIds.add(String(course._id));
                }
              });
            });
          });
        });
      });
    });

    // Get all assessments from enrolled courses (both submitted and pending)
    const enrolledAssessments = [];
    
    // Add submitted assessments and normalize course data
    assessments.forEach(assessment => {
      if (enrolledCourseIds.has(String(assessment.courseId))) {
        // Normalize course data - handle both populated and unpopulated
        const normalizedAssessment = assessment.toObject ? assessment.toObject() : { ...assessment };
        const courseIdStr = String(normalizedAssessment.courseId?._id || normalizedAssessment.courseId);
        
        // Find course and get week/day info
        const course = allCourses.find(c => String(c._id) === courseIdStr);
        if (course) {
          normalizedAssessment.course = {
            _id: course._id,
            title: course.title
          };
          
          // Find week and day numbers
          for (const week of course.weeks) {
            for (const day of week.days) {
              if (String(day._id) === String(assessment.dayId)) {
                normalizedAssessment.weekNumber = week.weekNumber;
                normalizedAssessment.dayNumber = day.dayNumber;
                break;
              }
            }
            if (normalizedAssessment.weekNumber) break;
          }
        } else if (normalizedAssessment.courseId && typeof normalizedAssessment.courseId === 'object') {
          normalizedAssessment.course = {
            _id: normalizedAssessment.courseId._id,
            title: normalizedAssessment.courseId.title || 'Unknown Course'
          };
        }
        enrolledAssessments.push(normalizedAssessment);
      }
    });

    // Find pending assessments (days with assessments but no submission)
    const pendingAssessments = [];
    allCourses.forEach(course => {
      if (enrolledCourseIds.has(String(course._id))) {
        course.weeks.forEach(week => {
          week.days.forEach(day => {
            if (day.assessment && day.assessment.trim()) {
              // Check if user has submitted this assessment
              const existingAssessment = assessments.find(
                a => String(a.courseId) === String(course._id) && String(a.dayId) === String(day._id)
              );
              
              if (!existingAssessment) {
                // This is a pending assessment
                pendingAssessments.push({
                  _id: null,
                  userId: userId,
                  courseId: course._id,
                  dayId: day._id,
                  assessmentTitle: day.assessment,
                  assessmentLink: day.assessmentLink || '',
                  submittedLink: '',
                  status: 'pending',
                  course: { _id: course._id, title: course.title },
                  weekNumber: week.weekNumber,
                  dayNumber: day.dayNumber,
                });
              }
            }
          });
        });
      }
    });

    // Combine submitted and pending assessments
    const allAssessments = [...enrolledAssessments, ...pendingAssessments];

    res.json(allAssessments);
  } catch (err) {
    console.error('Error fetching user assessments:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/assessments/user/:courseId
// @desc    Get all assessment progress for a user in a specific course
// @access  Private (User)
router.get('/user/:courseId', auth, async (req, res) => {
  try {
    const assessments = await UserAssessmentProgress.find({
      userId: req.user.id,
      courseId: req.params.courseId,
    }).sort({ submissionDate: -1 });
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/assessments/course/:courseId/day/:dayId
// @desc    Get assessment progress for a specific day for a user
// @access  Private (User)
router.get('/course/:courseId/day/:dayId', auth, async (req, res) => {
  try {
    const assessment = await UserAssessmentProgress.findOne({
      userId: req.user.id,
      courseId: req.params.courseId,
      dayId: req.params.dayId,
    });
    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/assessments/admin/course/:courseId
// @desc    Get all submitted assessments for a course (for admin review)
// @access  Private (Admin)
router.get('/admin/course/:courseId', auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied. Not an admin.' });
  }
  try {
    const assessments = await UserAssessmentProgress.find({
      courseId: req.params.courseId,
      status: { $in: ['submitted', 'waiting for review'] },
    }).populate('userId', 'name email').sort({ submissionDate: -1 });
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/assessments/admin/review/:assessmentProgressId
// @desc    Admin reviews and updates assessment status
// @access  Private (Admin)
router.put('/admin/review/:assessmentProgressId', auth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied. Not an admin.' });
  }

  const { status, feedback } = req.body;

  try {
    let userAssessment = await UserAssessmentProgress.findById(req.params.assessmentProgressId);

    if (!userAssessment) {
      return res.status(404).json({ msg: 'Exercise progress not found' });
    }

    userAssessment.status = status;
    userAssessment.feedback = feedback || '';
    userAssessment.reviewDate = new Date();
    userAssessment.reviewerId = req.user.id;

    await userAssessment.save();
    res.json(userAssessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
