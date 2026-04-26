import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function WorkflowLaundry() {
  const [form, setForm] = useState({
    tailoringRecordId: "",
    quantityLaundered: "",
    laundryGroup: "A",
    notes: "",
  });
  const [overview, setOverview] = useState(null);
  const [tailoringRecords, setTailoringRecords] = useState([]);

  const loadOverview = async () => {
    try {
      const [data, tailorList] = await Promise.all([
        workflowGet("/pipeline/overview"),
        workflowGet("/tailoring/records/pending"),
      ]);
      setOverview(data);
      setTailoringRecords(tailorList);
    } catch (_err) {
      setOverview(null);
      setTailoringRecords([]);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/laundry/records", {
        ...form,
        quantityLaundered: Number(form.quantityLaundered || 0),
      });
      alert("Laundry record saved");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const chartData = {
    labels: ["Tailoring Input", "Laundry Output", "Storage Received"],
    datasets: [
      {
        label: "Laundry Performance",
        data: [overview?.tailoringRecords || 0, overview?.laundryRecords || 0, overview?.storageRecords || 0],
        backgroundColor: ["#0284C7", "#06B6D4", "#67E8F9"],
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Laundry Stage Report" },
    },
    scales: {
      x: { title: { display: true, text: "Stage" } },
      y: { title: { display: true, text: "Record Count" }, beginAtZero: true },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-cyan-700 to-sky-500">
        <h2 className="text-2xl font-bold">Laundry Processing</h2>
        <p className="text-sm opacity-90">Record laundering output by Group A or Group B and pass to storage.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Laundry Stage Balance</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Summary Report</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Tailoring input: <strong>{overview?.tailoringRecords || 0}</strong></p>
            <p>Laundry output: <strong>{overview?.laundryRecords || 0}</strong></p>
            <p>Received by storage: <strong>{overview?.storageRecords || 0}</strong></p>
            <p>Laundry backlog: <strong>{Math.max((overview?.tailoringRecords || 0) - (overview?.laundryRecords || 0), 0)}</strong></p>
          </div>
        </div>
        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 xl:col-span-2" onSubmit={submit}>
          <h2 className="text-xl font-bold">Laundry Entry</h2>
          <select
            className="border p-2 rounded"
            value={form.tailoringRecordId}
            onChange={(e) => setForm({ ...form, tailoringRecordId: e.target.value })}
            required
          >
            <option value="" disabled>
              Select tailoring record
            </option>
            {tailoringRecords.map((t) => (
              <option key={t._id} value={t._id}>
                {t.quantityTailored} tailored • {new Date(t.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder="Quantity laundered" value={form.quantityLaundered} onChange={(e) => setForm({ ...form, quantityLaundered: e.target.value })} required />
          <select className="border p-2 rounded" value={form.laundryGroup} onChange={(e) => setForm({ ...form, laundryGroup: e.target.value })}>
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
          <textarea className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="bg-cyan-600 text-white p-2 rounded" type="submit">Save Laundry Record</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-2">Recent Tailoring Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Quantity Tailored</th>
                <th className="py-2">Date</th>
                <th className="py-2">Record ID</th>
              </tr>
            </thead>
            <tbody>
              {tailoringRecords.slice(0, 10).map((t) => (
                <tr key={t._id} className="border-b">
                  <td className="py-2">{t.quantityTailored}</td>
                  <td className="py-2">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-2 font-mono text-xs">{t._id}</td>
                </tr>
              ))}
              {!tailoringRecords.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={3}>
                    No tailoring records available yet.
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

export default WorkflowLaundry;
