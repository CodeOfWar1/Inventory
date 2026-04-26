import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(ArcElement, Tooltip, Legend);

function WorkflowDesigner() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    assignmentId: "",
    designerGroup: user?.designerGroup || "",
    itemsCut: "",
    sizes: "",
    cutType: "",
    notes: "",
  });
  const [overview, setOverview] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const loadOverview = async () => {
    try {
      const [data, assignmentList] = await Promise.all([
        workflowGet("/pipeline/overview"),
        workflowGet("/materials/assignments/pending"),
      ]);
      setOverview(data);
      setAssignments(assignmentList);
    } catch (_err) {
      setOverview(null);
      setAssignments([]);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/designers/output", {
        ...form,
        itemsCut: Number(form.itemsCut || 0),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      alert("Designer output saved");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const doughnutData = {
    labels: ["Assignments", "Designer Outputs", "Production Batches"],
    datasets: [
      {
        data: [overview?.assignments || 0, overview?.designerOutputs || 0, overview?.productionBatches || 0],
        backgroundColor: ["#7C3AED", "#8B5CF6", "#C4B5FD"],
      },
    ],
  };
  const doughnutOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Designer Output Distribution" },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-violet-700 to-purple-500">
        <h2 className="text-2xl font-bold">Designer Workbench</h2>
        <p className="text-sm opacity-90">Record cuts, sizes, and output quality for each assigned batch.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Design Progress Mix</h3>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Summary Report</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Assignments available: <strong>{overview?.assignments || 0}</strong></p>
            <p>Designer outputs recorded: <strong>{overview?.designerOutputs || 0}</strong></p>
            <p>Passed to production: <strong>{overview?.productionBatches || 0}</strong></p>
            <p>Output gap: <strong>{Math.max((overview?.assignments || 0) - (overview?.designerOutputs || 0), 0)}</strong></p>
          </div>
        </div>
        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3 xl:col-span-2" onSubmit={submit}>
          <h2 className="text-xl font-bold">Designer Entry</h2>
          <select
            className="border p-2 rounded"
            value={form.assignmentId}
            onChange={(e) => setForm({ ...form, assignmentId: e.target.value })}
            required
          >
            <option value="" disabled>
              Select assignment
            </option>
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.assignedGroup} • {a.rowsAssigned} rows • {new Date(a.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder="Designer Group" value={form.designerGroup} onChange={(e) => setForm({ ...form, designerGroup: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Number of items cut" value={form.itemsCut} onChange={(e) => setForm({ ...form, itemsCut: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Sizes (comma-separated, e.g. S,M,L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Cut type (e.g. full cut)" value={form.cutType} onChange={(e) => setForm({ ...form, cutType: e.target.value })} required />
          <textarea className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="bg-violet-600 text-white p-2 rounded" type="submit">Save Designer Output</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-2">Recent Assignments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Group</th>
                <th className="py-2">Rows</th>
                <th className="py-2">Date</th>
                <th className="py-2">Assignment ID</th>
              </tr>
            </thead>
            <tbody>
              {assignments.slice(0, 10).map((a) => (
                <tr key={a._id} className="border-b">
                  <td className="py-2">{a.assignedGroup}</td>
                  <td className="py-2">{a.rowsAssigned}</td>
                  <td className="py-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="py-2 font-mono text-xs">{a._id}</td>
                </tr>
              ))}
              {!assignments.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={4}>
                    No assignments found for your group yet.
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

export default WorkflowDesigner;
