import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { workflowGet } from "../utils/workflowApi";

const detailConfig = {
  warehouse_intakes: {
    title: "Warehouse Intakes",
    endpoint: "/materials/intakes",
    columns: ["color", "rows", "zipPackets", "needlePackets", "createdAt"],
    roles: ["warehouse_manager", "director"],
  },
  warehouse_assignments: {
    title: "Warehouse Assignments",
    endpoint: "/materials/assignments",
    columns: ["assignedGroup", "rowsAssigned", "assignmentDate", "createdAt"],
    roles: ["warehouse_manager", "designer", "director"],
  },
  designer_outputs: {
    title: "Designer Outputs",
    endpoint: "/designers/outputs",
    columns: ["designerGroup", "itemsCut", "cutType", "createdAt"],
    roles: ["designer", "production_tracker", "director"],
  },
  production_batches: {
    title: "Production Batches",
    endpoint: "/production/batches",
    columns: ["itemsProduced", "cutDetails", "createdAt"],
    roles: ["production_tracker", "tailor", "director"],
  },
  tailoring_records: {
    title: "Tailoring Records",
    endpoint: "/tailoring/records",
    columns: ["quantityTailored", "createdAt"],
    roles: ["tailor", "laundry", "director"],
  },
  laundry_records: {
    title: "Laundry Records",
    endpoint: "/laundry/records",
    columns: ["quantityLaundered", "laundryGroup", "createdAt"],
    roles: ["laundry", "store_manager", "director"],
  },
  storage_records: {
    title: "Storage Records",
    endpoint: "/storage/records",
    columns: ["quantityReceived", "ironingDone", "packagingDone", "createdAt"],
    roles: ["store_manager", "shop", "director"],
  },
  shop_stock: {
    title: "Shop Stock Summary",
    endpoint: "/shops/stock",
    columns: ["_id", "totalSent"],
    roles: ["shop", "store_manager", "director"],
  },
};

function formatCell(value, key) {
  if (value === null || value === undefined) return "-";
  if (key.toLowerCase().includes("date") || key === "createdAt") {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return String(value);
    }
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value._id) return value._id;
  return String(value);
}

function WorkflowDetailPage() {
  const { detailKey } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const config = detailConfig[detailKey];

  const roleAllowed = useMemo(() => {
    if (!config) return false;
    return config.roles.includes(user?.role);
  }, [config, user?.role]);

  useEffect(() => {
    const load = async () => {
      if (!config || !roleAllowed) {
        setLoading(false);
        return;
      }
      try {
        const data = await workflowGet(config.endpoint);
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [detailKey]);

  if (!config) {
    return (
      <div className="col-span-12 lg:col-span-10 p-4">
        <div className="bg-white p-4 rounded border">Unknown report page.</div>
      </div>
    );
  }

  if (!roleAllowed) {
    return (
      <div className="col-span-12 lg:col-span-10 p-4">
        <div className="bg-white p-4 rounded border">You do not have access to this report.</div>
      </div>
    );
  }

  const filteredRows = rows.filter((row) => {
    if (!search.trim()) return true;
    const text = config.columns.map((c) => formatCell(row[c], c)).join(" ").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const latestDate = rows[0]?.createdAt ? new Date(rows[0].createdAt).toLocaleString() : "N/A";

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen space-y-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-indigo-700 to-blue-600">
        <h2 className="text-2xl font-bold">{config.title}</h2>
        <p className="text-sm opacity-90 mt-1">Detailed records for this KPI card with searchable table view.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-gray-500">Total Records</p>
          <p className="text-2xl font-bold mt-2">{rows.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-gray-500">Latest Update</p>
          <p className="text-sm font-semibold mt-2">{latestDate}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-xs uppercase text-gray-500">Visible Columns</p>
          <p className="text-sm font-semibold mt-2">{config.columns.length}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="w-full md:max-w-sm">
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Search in this report..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/" className="px-3 py-2 bg-slate-800 text-white rounded text-sm w-fit">
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-600">Loading records...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  {config.columns.map((c) => (
                    <th key={c} className="py-2 pr-4 capitalize">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row._id || idx} className="border-b">
                    {config.columns.map((c) => (
                      <td key={c} className="py-2 pr-4">
                        {formatCell(row[c], c)}
                      </td>
                    ))}
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td className="py-3 text-gray-500" colSpan={config.columns.length}>
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowDetailPage;
