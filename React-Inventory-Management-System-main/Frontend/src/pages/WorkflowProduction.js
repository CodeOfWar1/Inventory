import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function WorkflowProduction() {
  const [form, setForm] = useState({
    designerOutputId: "",
    itemsProduced: "",
    sizes: "",
    cutDetails: "",
    notes: "",
  });
  const [overview, setOverview] = useState(null);
  const [outputs, setOutputs] = useState([]);

  const loadOverview = async () => {
    try {
      const [data, outputList] = await Promise.all([
        workflowGet("/pipeline/overview"),
        workflowGet("/designers/outputs/pending"),
      ]);
      setOverview(data);
      setOutputs(outputList);
    } catch (_err) {
      setOverview(null);
      setOutputs([]);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/production/batches", {
        ...form,
        itemsProduced: Number(form.itemsProduced || 0),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      alert("Production batch recorded");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const lineData = {
    labels: ["Designer Output", "Production", "Tailoring", "Laundry"],
    datasets: [
      {
        label: "Production Flow",
        data: [
          overview?.designerOutputs || 0,
          overview?.productionBatches || 0,
          overview?.tailoringRecords || 0,
          overview?.laundryRecords || 0,
        ],
        borderColor: "#EA580C",
        backgroundColor: "rgba(234, 88, 12, 0.15)",
        fill: true,
        tension: 0.35,
      },
    ],
  };
  const lineOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Production Flow Report" },
    },
    scales: {
      x: { title: { display: true, text: "Stage" } },
      y: { title: { display: true, text: "Record Count" }, beginAtZero: true },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-orange-700 to-amber-500">
        <h2 className="text-2xl font-bold">Production Control Center</h2>
        <p className="text-sm opacity-90">Capture production output and push clean batches to tailoring.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Production Progress Curve</h3>
          <Line data={lineData} options={lineOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Summary Report</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Designer inputs: <strong>{overview?.designerOutputs || 0}</strong></p>
            <p>Production batches: <strong>{overview?.productionBatches || 0}</strong></p>
            <p>Moved to tailoring: <strong>{overview?.tailoringRecords || 0}</strong></p>
            <p>Batch gap: <strong>{Math.max((overview?.designerOutputs || 0) - (overview?.productionBatches || 0), 0)}</strong></p>
          </div>
        </div>
        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 xl:col-span-2" onSubmit={submit}>
          <h2 className="text-xl font-bold">Production Entry</h2>
          <select
            className="border p-2 rounded"
            value={form.designerOutputId}
            onChange={(e) => setForm({ ...form, designerOutputId: e.target.value })}
            required
          >
            <option value="" disabled>
              Select designer output
            </option>
            {outputs.map((o) => (
              <option key={o._id} value={o._id}>
                {o.designerGroup} • {o.itemsCut} cut • {new Date(o.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder="Items produced" value={form.itemsProduced} onChange={(e) => setForm({ ...form, itemsProduced: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Sizes (comma-separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Cut details" value={form.cutDetails} onChange={(e) => setForm({ ...form, cutDetails: e.target.value })} required />
          <textarea className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="bg-orange-600 text-white p-2 rounded" type="submit">Save Production Output</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-2">Recent Designer Outputs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Group</th>
                <th className="py-2">Items Cut</th>
                <th className="py-2">Cut Type</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {outputs.slice(0, 10).map((o) => (
                <tr key={o._id} className="border-b">
                  <td className="py-2">{o.designerGroup}</td>
                  <td className="py-2">{o.itemsCut}</td>
                  <td className="py-2">{o.cutType}</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!outputs.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={4}>
                    No designer outputs available yet.
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

export default WorkflowProduction;
