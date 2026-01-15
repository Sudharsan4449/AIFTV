/**
 * Aggregation Pipelines for Reports & Analytics
 */

/**
 * Daily Compliance Summary
 * Shows total tasks, approved, flagged, rejected
 */
export const dailyCompliancePipeline = (date) => [
  {
    $match: {
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      }
    }
  },
  {
    $group: {
      _id: "$decision",
      count: { $sum: 1 }
    }
  }
];

/**
 * Employee Performance Report
 * Approval rate, average cleanliness score
 */
export const employeePerformancePipeline = () => [
  {
    $group: {
      _id: "$userId",
      totalTasks: { $sum: 1 },
      approvedCount: {
        $sum: {
          $cond: [{ $eq: ["$decision", "APPROVED"] }, 1, 0]
        }
      },
      avgCleanlinessScore: { $avg: "$cleanlinessScore" }
    }
  }
];

/**
 * Fraud & Rejection Pattern Report
 */
export const fraudPatternPipeline = () => [
  {
    $match: {
      decision: { $in: ["REJECTED", "FLAGGED"] }
    }
  },
  {
    $group: {
      _id: "$remarks",
      count: { $sum: 1 }
    }
  }
];
