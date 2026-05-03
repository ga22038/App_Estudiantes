import { renderCareerBreakdown, renderMetrics } from "./ui.js";
import { computeMetricsFallback } from "./student-utils.js";

export function createMetricsController({
  dom,
  getMetricNodes,
  workerUrl,
  notify,
}) {
  let worker = null;

  function setup() {
    try {
      worker = new Worker(workerUrl);
      worker.onmessage = (event) => {
        renderMetrics(getMetricNodes(), event.data);
        renderCareerBreakdown(dom.careerBreakdown, event.data.porCarrera ?? {});
      };
    } catch (error) {
      console.error("No fue posible iniciar el Web Worker.", error);
      worker = null;
      notify(
        "warning",
        "Worker no disponible",
        "Las metricas se calcularan en el hilo principal como respaldo."
      );
    }
  }

  function update(students) {
    if (worker) {
      try {
        worker.postMessage(students);
        return;
      } catch (error) {
        console.error("Error al enviar datos al worker.", error);
      }
    }

    const fallbackMetrics = computeMetricsFallback(students);
    renderMetrics(getMetricNodes(), fallbackMetrics);
    renderCareerBreakdown(dom.careerBreakdown, fallbackMetrics.porCarrera);
  }

  return {
    setup,
    update,
  };
}
