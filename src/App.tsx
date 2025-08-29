import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./App.css";
import type { TimeFrame } from "./type";
import { useStockData } from "./hooks/useStockData";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const {
    chartData,
    loading,
    error,
    activeTimeFrame,
    handleTimeFrameChange,
    retryFetch,
  } = useStockData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `TSLA Stock - ${
          activeTimeFrame.charAt(0).toUpperCase() + activeTimeFrame.slice(1)
        } Chart`,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y;
            return `Close: $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        position: "left" as const,
        title: {
          display: true,
          text: "Price ($)",
        },
        ticks: {
          callback: function (value: any) {
            return "$" + value.toFixed(2);
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
        ticks: {
          maxTicksLimit: 15,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const getButtonClassName = (timeFrame: TimeFrame) => {
    let className = "timeframe-button";
    if (activeTimeFrame === timeFrame) className += " active";
    if (loading) className += " loading";
    return className;
  };

  return (
    <div className="app-container">
      {/* Time Frame Buttons */}
      <div className="button-container">
        <button
          className={getButtonClassName("hourly")}
          onClick={() => handleTimeFrameChange("hourly")}
          disabled={loading}
        >
          Hourly
        </button>
        <button
          className={getButtonClassName("daily")}
          onClick={() => handleTimeFrameChange("daily")}
          disabled={loading}
        >
          Daily
        </button>
        <button
          className={getButtonClassName("weekly")}
          onClick={() => handleTimeFrameChange("weekly")}
          disabled={loading}
        >
          Weekly
        </button>
        <button
          className={getButtonClassName("monthly")}
          onClick={() => handleTimeFrameChange("monthly")}
          disabled={loading}
        >
          Monthly
        </button>
      </div>

      <div className="chart-container">
        {loading && (
          <div className="loading-state">
            <div>Loading {activeTimeFrame} data...</div>
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-message">
              Error: {error}
            </div>
            <button
              onClick={retryFetch}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && chartData && (
          <Line data={chartData} options={options} />
        )}

        {!loading && !error && !chartData && (
          <div className="no-data-state">
            <div>No data available</div>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
