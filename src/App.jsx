import { useEffect, useMemo, useState } from "react";
import "./App.css";

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
};

const getReminderLevel = (percent) => {
  if (percent >= 90) return "Critical";
  if (percent >= 70) return "High";
  if (percent >= 50) return "Moderate";
  return "Safe";
};

function App() {
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(180);
  const [reminderPercent, setReminderPercent] = useState(75);
  const [usageData] = useState([
    { name: "Work", value: 40 },
    { name: "Study", value: 25 },
    { name: "Social", value: 20 },
    { name: "Entertainment", value: 15 },
  ]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = setInterval(() => {
      setElapsedSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const usageToday = Math.floor(elapsedSeconds / 60);

  const averageDaily = useMemo(() => {
    const values = [150, 170, 190, 210, 140, 175, 160];
    return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
  }, []);

  const goalPercentage = Math.min(
    100,
    Math.round((usageToday / dailyGoal) * 100)
  );

  const reminderValue = Math.min(
    100,
    Math.round((usageToday / (dailyGoal * (reminderPercent / 100))) * 100)
  );

  const usageSummary = useMemo(() => {
    const total = usageData.reduce((sum, item) => sum + item.value, 0);
    return usageData.map((item) => ({
      ...item,
      percentage: Math.round((item.value / total) * 100),
    }));
  }, [usageData]);

  const reminderLevel = getReminderLevel(reminderValue);

  const handleReset = () => {
    setElapsedSeconds(0);
    setIsRunning(false);
  };

  const updateGoal = (value) => {
    setDailyGoal(Math.min(600, Math.max(30, Number(value) || 30)));
  };

  const toggleTimer = () => setIsRunning((previous) => !previous);

  return (
    <div className="app">
      <div className="container">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Screen Time Manager</h1>
          </div>
          <button className="primary-btn" onClick={toggleTimer}>
            {isRunning ? "Pause" : "Start"}
          </button>
        </header>

        <section className="hero-grid">
          <div className="card timer-card">
            <div className="card-head">
              <span>Stopwatch</span>
              <span className={`dot ${isRunning ? "green" : "paused"}`} />
            </div>
            <div className="stopwatch">{formatTime(elapsedSeconds)}</div>
            <div className="timer-actions">
              <button className="secondary-btn" onClick={toggleTimer}>
                {isRunning ? "Pause" : "Resume"}
              </button>
              <button className="ghost-btn" onClick={handleReset}>Reset</button>
            </div>
          </div>

          <div className="card goal-card">
            <div className="card-head">
              <span>Daily Goal</span>
              <span className="dot amber" />
            </div>
            <div className="big-number">{dailyGoal} min</div>
            <label className="input-label">
              Set goal (minutes)
              <input
                type="number"
                min="30"
                max="600"
                value={dailyGoal}
                onChange={(event) => updateGoal(event.target.value)}
              />
            </label>
            <div className="progress-box">
              <div className="progress-row">
                <span>Used</span>
                <span>{usageToday} min</span>
              </div>
              <div className="progress-bar" aria-label={`${goalPercentage}% of daily goal used`}>
                <div className="progress-fill" style={{ width: `${goalPercentage}%` }} />
              </div>
              <small>{goalPercentage}% of your daily goal</small>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="card"><p className="label">Average</p><h2>{averageDaily} min</h2><span className="muted">Average daily screen time</span></div>
          <div className="card"><p className="label">Percentage Used</p><h2>{goalPercentage}%</h2><span className="muted">Goal completion</span></div>
          <div className="card"><p className="label">Reminder</p><h2>{reminderPercent}%</h2><span className="muted">Set reminder threshold</span></div>
          <div className="card"><p className="label">Status</p><h2>{reminderLevel}</h2><span className="muted">{reminderValue >= 100 ? "You are over the reminder limit" : "Within reminder range"}</span></div>
        </section>

        <section className="bottom-grid">
          <div className="card">
            <div className="card-head"><span>Usage by category</span></div>
            <div className="usage-list">
              {usageSummary.map((item) => (
                <div key={item.name} className="usage-item">
                  <div className="usage-label"><span>{item.name}</span><strong>{item.percentage}%</strong></div>
                  <div className="progress-bar slim"><div className={`progress-fill category-${item.name.toLowerCase()}`} style={{ width: `${item.percentage}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><span>Reminder Management</span></div>
            <label className="input-label">
              Reminder percentage
              <input type="range" min="20" max="100" value={reminderPercent} onChange={(event) => setReminderPercent(Number(event.target.value))} />
            </label>
            <div className="reminder-box">
              <div className="reminder-circle"><strong>{reminderPercent}%</strong></div>
              <div><p className="reminder-status">{reminderLevel}</p><small>{reminderValue >= 100 ? "Reminder triggered: screen time is above the planned limit." : "Good progress: you are staying below the reminder threshold."}</small></div>
            </div>
            <div className="mini-stat"><span>Today</span><strong>{usageToday} min</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
