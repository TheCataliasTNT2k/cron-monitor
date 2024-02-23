import axios from "axios";

// This API simply proxies the HealthChecks' Prometheus metrics endpoint. It's useful for laoding metrics directly into grafana without need for Prometheus server or scraping.
export default async function handler(req, res) {
  try {
    if (
      !process.env.PROMETHEUS_METRICS_ENABLED ||
      !process.env.PROMETHEUS_METRICS_ENDPOINT
    ) {
      return res.status(500).send("Prometheus metrics are not enabled");
    }
    if (process.env.AUTH_ENABLED) {
      const authorization = req.headers.authorization;
      if (
        !authorization ||
        !authorization.startsWith("Bearer ") ||
        authorization.split(" ")[1] !== process.env.DEFAULT_AUTH_TOKEN
      ) {
        return res.status(401).send("Unauthorized");
      }
    }

    const response = await axios.get(process.env.PROMETHEUS_METRICS_ENDPOINT);
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(response.data);
  } catch (error) {
    console.log("Error retrieving metrics:", error);
    res.status(500).send("Error retrieving metrics");
  }
}
