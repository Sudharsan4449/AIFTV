/**
 * Prediction Engine for Task Scheduling
 * Suggests optimal times for roadside cleaning tasks
 */

export const predictOptimalSchedule = ({
  historicalTasks,
  weatherData,
  trafficData,
  currentDate
}) => {
  /**
   * historicalTasks: [{ date, time, cleanlinessScore }]
   * weatherData: { temperature, humidity, windSpeed }
   * trafficData: { vehicleCount, pedestrianCount }
   * currentDate: Date object
   */

  // Simple heuristic: Avoid peak traffic, prefer good weather
  const hour = currentDate.getHours();
  const isPeakTraffic = hour >= 8 && hour <= 10 || hour >= 17 && hour <= 19;
  const isGoodWeather = weatherData.temperature > 15 && weatherData.temperature < 35;

  const score = isGoodWeather ? 10 : 5;
  const trafficPenalty = isPeakTraffic ? 5 : 0;

  const finalScore = score - trafficPenalty;

  return {
    recommendedTime: currentDate.toISOString(),
    score: finalScore,
    factors: {
      weather: isGoodWeather,
      traffic: !isPeakTraffic
    }
  };
};
