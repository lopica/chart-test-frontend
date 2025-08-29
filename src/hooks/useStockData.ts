import { useState, useEffect, useCallback } from "react";
import type { ApiResponse, ChartData, TimeFrame } from "../type";

export const useStockData = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTimeFrame, setActiveTimeFrame] = useState<TimeFrame>("daily");

  const formatDate = useCallback((dateString: string, timeFrame: TimeFrame): string => {
    const date = new Date(dateString);

    switch (timeFrame) {
      case "hourly":
        return date.toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      case "daily":
        return date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        });
      case "weekly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "2-digit",
        });
      case "monthly":
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      default:
        return date.toLocaleDateString();
    }
  }, []);

  const fetchStockData = useCallback(async (timeFrame: TimeFrame) => {
    try {
      setLoading(true);
      setError(null);

      const url = `https://chart.stockscan.io/candle/v3/TSLA/${timeFrame}/NASDAQ`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log(`API Response for ${timeFrame}:`, data);

      if (!data.candles || data.candles.length === 0) {
        throw new Error("No candle data received");
      }

      const sortedCandles = [...data.candles].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const formattedData: ChartData = {
        labels: sortedCandles.map((item) => formatDate(item.date, timeFrame)),
        datasets: [
          {
            label: "TSLA Close Price",
            data: sortedCandles.map((item) => item.close),
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            tension: 0.1,
          },
        ],
      };

      setChartData(formattedData);
      setActiveTimeFrame(timeFrame);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching stock data:", err);
    } finally {
      setLoading(false);
    }
  }, [formatDate]);

  const handleTimeFrameChange = useCallback((timeFrame: TimeFrame) => {
    if (timeFrame !== activeTimeFrame && !loading) {
      fetchStockData(timeFrame);
    }
  }, [activeTimeFrame, loading, fetchStockData]);

  const retryFetch = useCallback(() => {
    fetchStockData(activeTimeFrame);
  }, [activeTimeFrame, fetchStockData]);

  useEffect(() => {
    fetchStockData(activeTimeFrame);
  }, []);

  return {
    chartData,
    loading,
    error,
    activeTimeFrame,
    handleTimeFrameChange,
    retryFetch,
  };
};