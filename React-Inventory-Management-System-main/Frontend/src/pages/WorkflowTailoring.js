import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function WorkflowTailoring() {
  const [form, setForm] = useState({
    productionBatchId: "",
    quantityTailored: "",
    sizes: "",
    notes: "",
  });
  const [overview, setOverview] = useState(null);
  const [batches, setBatches] = useState([]);

  const loadOverview = async () => {
    try {
      const [data, batchList] = await Promise.all([
        workflowGet("/pipeline/overview"),
        workflowGet("/production/batches/pending"),
      ]);
      setOverview(data);
      setBatches(batchList);
    } catch (_err) {
      setOverview(null);
      setBatches([]);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/tailoring/records", {
        ...form,
        quantityTailored: Number(form.quantityTailored || 0),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      alert("Tailoring record saved");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const chartData = {
    labels: ["Production", "Tailoring", "Laundry"],
    datasets: [
      {
        label: "Tailoring Workload",
        data: [overview?.productionBatches || 0, overview?.tailoringRecords || 0, overview?.laundryRecords || 0],
        backgroundColor: ["#059669", "#10B981", "#34D399"],
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Tailoring Stage Report" },
    },
    scales: {
      x: { title: { display: true, text: "Stage" } },
      y: { title: { display: true, text: "Record Count" }, beginAtZero: true },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-emerald-700 to-green-500">
        <h2 className="text-2xl font-bold">Tailoring Unit</h2>
        <p className="text-sm opacity-90">Track quantities tailored and maintain batch size accuracy.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Tailoring to Laundry Readiness</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Summary Report</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Production input: <strong>{overview?.productionBatches || 0}</strong></p>
            <p>Tailoring records: <strong>{overview?.tailoringRecords || 0}</strong></p>
            <p>Sent to laundry: <strong>{overview?.laundryRecords || 0}</strong></p>
            <p>Tailoring backlog: <strong>{Math.max((overview?.productionBatches || 0) - (overview?.tailoringRecords || 0), 0)}</strong></p>
          </div>
        </div>
        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 xl:col-span-2" onSubmit={submit}>
          <h2 className="text-xl font-bold">Tailoring Entry</h2>
          <select
            className="border p-2 rounded"
            value={form.productionBatchId}
            onChange={(e) => setForm({ ...form, productionBatchId: e.target.value })}
            required
          >
            <option value="" disabled>
              Select production batch
            </option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.itemsProduced} produced • {new Date(b.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder="Quantity tailored" value={form.quantityTailored} onChange={(e) => setForm({ ...form, quantityTailored: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Sizes (comma-separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} required />
          <textarea className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="bg-emerald-600 text-white p-2 rounded" type="submit">Save Tailoring Record</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-2">Recent Production Batches</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Items Produced</th>
                <th className="py-2">Cut Details</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {batches.slice(0, 10).map((b) => (
                <tr key={b._id} className="border-b">
                  <td className="py-2">{b.itemsProduced}</td>
                  <td className="py-2">{b.cutDetails}</td>
                  <td className="py-2">{new Date(b.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!batches.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={3}>
                    No production batches available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorkflowTailoring;
