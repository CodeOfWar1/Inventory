import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(ArcElement, Tooltip, Legend);

function WorkflowStorage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    laundryRecordId: "",
    quantityReceived: "",
    sizes: "",
    ironingDone: false,
    packagingDone: false,
    notes: "",
  });
  const [overview, setOverview] = useState(null);
  const [laundryRecords, setLaundryRecords] = useState([]);
  const [storageRecords, setStorageRecords] = useState([]);

  const loadOverview = async () => {
    try {
      const requests = [
        workflowGet("/pipeline/overview"),
        workflowGet("/laundry/records/pending"),
        workflowGet("/storage/records"),
      ];
      const [data, laundryList, storageList] = await Promise.all(requests);
      setOverview(data);
      setLaundryRecords(laundryList);
      setStorageRecords(storageList);
    } catch (_err) {
      setOverview(null);
      setLaundryRecords([]);
      setStorageRecords([]);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/storage/records", {
        ...form,
        quantityReceived: Number(form.quantityReceived || 0),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      alert("Storage record saved");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const doughnutData = {
    labels: ["Storage Records", "Shop Distributions"],
    datasets: [
      {
        data: [overview?.storageRecords || 0, overview?.shopDistributions || 0],
        backgroundColor: ["#334155", "#0EA5E9"],
      },
    ],
  };
  const doughnutOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Storage vs Distribution Report" },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-slate-700 to-slate-500">
        <h2 className="text-2xl font-bold">Storage Management</h2>
        <p className="text-sm opacity-90">Receive laundered items, track packaging status, and manage finished stock.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Storage vs Dispatch</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Summary Report</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Laundry input records: <strong>{overview?.laundryRecords || 0}</strong></p>
            <p>Storage records created: <strong>{overview?.storageRecords || 0}</strong></p>
            <p>Items distributed: <strong>{overview?.shopDistributions || 0}</strong></p>
            <p>Storage balance: <strong>{Math.max((overview?.storageRecords || 0) - (overview?.shopDistributions || 0), 0)}</strong></p>
          </div>
        </div>
        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 xl:col-span-2" onSubmit={submit}>
          <h2 className="text-xl font-bold">Storage Entry</h2>
          <select
            className="border p-2 rounded"
            value={form.laundryRecordId}
            onChange={(e) => setForm({ ...form, laundryRecordId: e.target.value })}
            required
            disabled={user?.role !== "store_manager"}
          >
            <option value="" disabled>
              Select laundry record
            </option>
            {laundryRecords.map((l) => (
              <option key={l._id} value={l._id}>
                {l.quantityLaundered} laundered • Group {l.laundryGroup} • {new Date(l.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder="Quantity received" value={form.quantityReceived} onChange={(e) => setForm({ ...form, quantityReceived: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Sizes (comma-separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} required />
          <label className="flex gap-2"><input type="checkbox" checked={form.ironingDone} onChange={(e) => setForm({ ...form, ironingDone: e.target.checked })} /> Ironing done</label>
          <label className="flex gap-2"><input type="checkbox" checked={form.packagingDone} onChange={(e) => setForm({ ...form, packagingDone: e.target.checked })} /> Packaging done</label>
          <textarea className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="bg-slate-700 text-white p-2 rounded" type="submit" disabled={user?.role !== "store_manager"}>
            Save Storage Record
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-2">Recent Storage Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Quantity</th>
                <th className="py-2">Ironed</th>
                <th className="py-2">Packed</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {storageRecords.slice(0, 10).map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="py-2">{s.quantityReceived}</td>
                  <td className="py-2">{s.ironingDone ? "Yes" : "No"}</td>
                  <td className="py-2">{s.packagingDone ? "Yes" : "No"}</td>
                  <td className="py-2">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!storageRecords.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={4}>
                    No storage records available yet.
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

export default WorkflowStorage;
