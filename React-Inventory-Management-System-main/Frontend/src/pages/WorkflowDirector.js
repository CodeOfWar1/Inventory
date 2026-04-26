import { useEffect, useState } from "react";
import { workflowGet } from "../utils/workflowApi";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function WorkflowDirector() {
  const [stats, setStats] = useState(null);
  const [selectedRole, setSelectedRole] = useState("warehouse_manager");
  const [activity, setActivity] = useState([]);

  const loadOverview = async () => {
    try {
      const [data, activityData] = await Promise.all([
        workflowGet("/pipeline/overview"),
        workflowGet("/activity"),
      ]);
      setStats(data);
      setActivity(activityData);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (!stats) {
    return <div className="col-span-12 lg:col-span-10 p-4">Loading overview...</div>;
  }

  const roleViews = {
    warehouse_manager: {
      title: "Warehouse Progress",
      labels: ["Materials", "Assignments", "Storage Ready"],
      values: [stats.materials, stats.assignments, stats.storageRecords],
      cards: [
        { key: "Materials Received", value: stats.materials },
        { key: "Rows Assigned", value: stats.assignments },
        { key: "Pending Assignment", value: Math.max(stats.materials - stats.assignments, 0) },
        { key: "Sent Forward", value: stats.designerOutputs },
      ],
    },
    designer: {
      title: "Designer Progress",
      labels: ["Assignments", "Designer Outputs", "Production Handover"],
      values: [stats.assignments, stats.designerOutputs, stats.productionBatches],
      cards: [
        { key: "Assigned Batches", value: stats.assignments },
        { key: "Cuts Recorded", value: stats.designerOutputs },
        { key: "Production Follow-up", value: stats.productionBatches },
        { key: "Pipeline Gap", value: Math.max(stats.assignments - stats.designerOutputs, 0) },
      ],
    },
    production_tracker: {
      title: "Production Progress",
      labels: ["Designer Inputs", "Production Batches", "Tailoring Handover"],
      values: [stats.designerOutputs, stats.productionBatches, stats.tailoringRecords],
      cards: [
        { key: "Designer Inputs", value: stats.designerOutputs },
        { key: "Batches Produced", value: stats.productionBatches },
        { key: "Tailoring Queue", value: stats.tailoringRecords },
        { key: "In Production", value: Math.max(stats.designerOutputs - stats.productionBatches, 0) },
      ],
    },
    tailor: {
      title: "Tailoring Progress",
      labels: ["Production", "Tailoring", "Laundry Handover"],
      values: [stats.productionBatches, stats.tailoringRecords, stats.laundryRecords],
      cards: [
        { key: "Production Input", value: stats.productionBatches },
        { key: "Tailored", value: stats.tailoringRecords },
        { key: "Sent to Laundry", value: stats.laundryRecords },
        { key: "Tailoring Backlog", value: Math.max(stats.productionBatches - stats.tailoringRecords, 0) },
      ],
    },
    laundry: {
      title: "Laundry Progress",
      labels: ["Tailoring", "Laundry", "Storage Handover"],
      values: [stats.tailoringRecords, stats.laundryRecords, stats.storageRecords],
      cards: [
        { key: "Tailoring Input", value: stats.tailoringRecords },
        { key: "Laundered", value: stats.laundryRecords },
        { key: "Sent to Storage", value: stats.storageRecords },
        { key: "Laundry Backlog", value: Math.max(stats.tailoringRecords - stats.laundryRecords, 0) },
      ],
    },
    store_manager: {
      title: "Storage Progress",
      labels: ["Laundry Input", "Stored", "Distributed"],
      values: [stats.laundryRecords, stats.storageRecords, stats.shopDistributions],
      cards: [
        { key: "Laundry Input", value: stats.laundryRecords },
        { key: "Stored Items", value: stats.storageRecords },
        { key: "Distributed", value: stats.shopDistributions },
        { key: "Storage Balance", value: Math.max(stats.storageRecords - stats.shopDistributions, 0) },
      ],
    },
    shop: {
      title: "Shop Progress",
      labels: ["Stored", "Distributed"],
      values: [stats.storageRecords, stats.shopDistributions],
      cards: [
        { key: "Available from Storage", value: stats.storageRecords },
        { key: "Shop Received", value: stats.shopDistributions },
        { key: "Coverage", value: stats.storageRecords ? `${Math.round((stats.shopDistributions / stats.storageRecords) * 100)}%` : "0%" },
        { key: "Distribution Gap", value: Math.max(stats.storageRecords - stats.shopDistributions, 0) },
      ],
    },
  };

  const activeView = roleViews[selectedRole];

  const barData = {
    labels: activeView.labels,
    datasets: [
      {
        label: `${activeView.title} Metrics`,
        data: activeView.values,
        backgroundColor: "rgba(37, 99, 235, 0.65)",
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: activeView.labels,
    datasets: [
      {
        data: activeView.values,
        backgroundColor: [
          "#1D4ED8",
          "#2563EB",
          "#3B82F6",
          "#60A5FA",
          "#34D399",
          "#10B981",
          "#F59E0B",
          "#EF4444",
        ],
      },
    ],
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 space-y-4">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Director Command Center</h2>
        <p className="text-sm text-gray-500 mt-1">
          End-to-end visibility across warehouse, production, and distribution. Select a role to inspect detailed progress.
        </p>
        <div className="mt-4">
          <label className="text-sm text-gray-600 mr-2">View role progress:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="warehouse_manager">Warehouse Manager</option>
            <option value="designer">Designer</option>
            <option value="production_tracker">Production Tracker</option>
            <option value="tailor">Tailor</option>
            <option value="laundry">Laundry</option>
            <option value="store_manager">Store Manager</option>
            <option value="shop">Shop</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {activeView.cards.map((item) => (
          <div key={item.key} className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{item.key}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">{activeView.title} - Bar View</h3>
          <Bar data={barData} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">{activeView.title} - Distribution View</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Recent Activity (Audit Log)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Time</th>
                <th className="py-2">Role</th>
                <th className="py-2">Action</th>
                <th className="py-2">Entity</th>
                <th className="py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {activity.slice(0, 20).map((a) => (
                <tr key={a._id} className="border-b">
                  <td className="py-2">{new Date(a.createdAt).toLocaleString()}</td>
                  <td className="py-2">{a.actorRole}</td>
                  <td className="py-2">{a.action}</td>
                  <td className="py-2">{a.entityType}</td>
                  <td className="py-2">{a.message}</td>
                </tr>
              ))}
              {!activity.length && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={5}>
                    No activity yet.
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

export default WorkflowDirector;
