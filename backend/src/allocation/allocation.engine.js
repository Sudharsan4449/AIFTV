/**
 * Task Allocation Recommendation Engine
 * This engine suggests suitable employees for a new task
 */

export const recommendEmployees = ({
  employees,
  activeTaskCounts,
  pastPerformanceScores
}) => {
  /**
   * employees: [{ userId, name }]
   * activeTaskCounts: { userId: number }
   * pastPerformanceScores: { userId: number (0-100) }
   */

  const recommendations = employees.map((emp) => {
    const workload = activeTaskCounts[emp.userId] || 0;
    const performance = pastPerformanceScores[emp.userId] || 50;

    /**
     * Lower workload + higher performance = better score
     */
    const allocationScore =
      performance * 0.7 - workload * 10;

    return {
      userId: emp.userId,
      name: emp.name,
      workload,
      performance,
      allocationScore
    };
  });

  return recommendations.sort(
    (a, b) => b.allocationScore - a.allocationScore
  );
};
