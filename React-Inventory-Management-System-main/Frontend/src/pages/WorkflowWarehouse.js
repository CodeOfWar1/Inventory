import { useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function WorkflowWarehouse() {
  const [intake, setIntake] = useState({
    rows: "",
    color: "white",
    zipPackets: "",
    needlePackets: "",
    badgePinPackets: "",
    notes: "",
  });
  const [assignment, setAssignment] = useState({
    materialIntakeId: "",
    assignedGroup: "",
    rowsAssigned: "",
    assignmentDate: "",
    notes: "",
  });
  const [overview, setOverview] = useState(null);
  const [intakes, setIntakes] = useState([]);

  const loadOverview = async () => {
    try {
      const [data, intakeList] = await Promise.all([
        workflowGet("/pipeline/overview"),
        workflowGet("/materials/intakes"),
      ]);
      setOverview(data);
      setIntakes(intakeList);
    } catch (_err) {
      setOverview(null);
      setIntakes([]);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const submitIntake = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/materials/intake", {
        ...intake,
        rows: Number(intake.rows || 0),
        zipPackets: Number(intake.zipPackets || 0),
        needlePackets: Number(intake.needlePackets || 0),
        badgePinPackets: Number(intake.badgePinPackets || 0),
      });
      alert("Material intake saved");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/materials/assign", {
        ...assignment,
        rowsAssigned: Number(assignment.rowsAssigned || 0),
      });
      alert("Material assigned to designer group");
      loadOverview();
    } catch (err) {
      alert(err.message);
    }
  };

  const cards = useMemo(() => {
    const materials = overview?.materials || 0;
    const assignments = overview?.assignments || 0;
    return [
      { label: "Materials Received", value: materials },
      { label: "Rows Assigned", value: assignments },
      { label: "Pending Assignment", value: Math.max(materials - assignments, 0) },
      { label: "Moved to Storage", value: overview?.storageRecords || 0 },
    ];
  }, [overview]);

  const chartData = {
    labels: ["Materials", "Assignments", "Designer Output", "Storage"],
    datasets: [
      {
        label: "Warehouse Pipeline",
        data: [
          overview?.materials || 0,
          overview?.assignments || 0,
          overview?.designerOutputs || 0,
          overview?.storageRecords || 0,
        ],
        backgroundColor: ["#1D4ED8", "#2563EB", "#38BDF8", "#10B981"],
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Warehouse Stage Report" },
    },
    scales: {
      x: { title: { display: true, text: "Workflow Stage" } },
      y: { title: { display: true, text: "Record Count" }, beginAtZero: true },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-blue-700 to-blue-500">
        <h2 className="text-2xl font-bold">Warehouse Operations</h2>
        <p className="text-sm opacity-90">Manage incoming materials and assign rows to designer groups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-xs uppercase text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Warehouse Throughput</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-4">
        <h3 className="font-semibold text-gray-700 mb-2">Summary Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <p>Total materials records: <strong>{overview?.materials || 0}</strong></p>
          <p>Total assignment records: <strong>{overview?.assignments || 0}</strong></p>
          <p>Designer output records: <strong>{overview?.designerOutputs || 0}</strong></p>
          <p>Current pending assignment gap: <strong>{Math.max((overview?.materials || 0) - (overview?.assignments || 0), 0)}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3" onSubmit={submitIntake}>
          <h3 className="font-semibold">Record Incoming Materials</h3>
          <input className="border p-2 rounded" placeholder="Rows" value={intake.rows} onChange={(e) => setIntake({ ...intake, rows: e.target.value })} required />
          <select className="border p-2 rounded" value={intake.color} onChange={(e) => setIntake({ ...intake, color: e.target.value })}>
            <option value="white">white</option>
            <option value="navy_blue">navy blue</option>
            <option value="light_blue">light blue</option>
            <option value="sky_blue">sky blue</option>
            <option value="bsp_green">BSP green</option>
            <option value="scrap_green">scrap green</option>
          </select>
          <input className="border p-2 rounded" placeholder="Zip packets" value={intake.zipPackets} onChange={(e) => setIntake({ ...intake, zipPackets: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Needle packets" value={intake.needlePackets} onChange={(e) => setIntake({ ...intake, needlePackets: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Badges & pins packets" value={intake.badgePinPackets} onChange={(e) => setIntake({ ...intake, badgePinPackets: e.target.value })} />
          <textarea className="border p-2 rounded" placeholder="Notes" value={intake.notes} onChange={(e) => setIntake({ ...intake, notes: e.target.value })} />
          <button className="bg-blue-600 text-white p-2 rounded" type="submit">Save Intake</button>
        </form>

        <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3" onSubmit={submitAssignment}>
          <h3 className="font-semibold">Assign Materials to Designer Group</h3>
          <select
            className="border p-2 rounded"
            value={assignment.materialIntakeId}
            onChange={(e) => setAssignment({ ...assignment, materialIntakeId: e.target.value })}
            required
          >
            <option value="" disabled>
              Select material intake
            </option>
            {intakes.map((i) => (
              <option key={i._id} value={i._id}>
                {i.color} • {i.rows} rows • remaining {i.remainingRows ?? "-"} • {new Date(i.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <input className="border p-2 rounded" placeholder="Assigned group (e.g., Group 1)" value={assignment.assignedGroup} onChange={(e) => setAssignment({ ...assignment, assignedGroup: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Rows assigned" value={assignment.rowsAssigned} onChange={(e) => setAssignment({ ...assignment, rowsAssigned: e.target.value })} required />
          <input className="border p-2 rounded" type="date" value={assignment.assignmentDate} onChange={(e) => setAssignment({ ...assignment, assignmentDate: e.target.value })} />
          <textarea className="border p-2 rounded" placeholder="Notes" value={assignment.notes} onChange={(e) => setAssignment({ ...assignment, notes: e.target.value })} />
          <button className="bg-emerald-600 text-white p-2 rounded" type="submit">Assign Material</button>
        </form>
      </div>
    </div>
  );
}

export default WorkflowWarehouse;
