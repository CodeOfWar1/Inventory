import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { workflowGet, workflowPost } from "../utils/workflowApi";

ChartJS.register(ArcElement, Tooltip, Legend);

function WorkflowShop() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [form, setForm] = useState({
    storageRecordId: "",
    shopName: "Lusaka",
    quantitySent: "",
    sizes: "",
    notes: "",
  });
  const [stock, setStock] = useState([]);
  const [storageRecords, setStorageRecords] = useState([]);

  const loadStock = async () => {
    try {
      const [result, storageList] = await Promise.all([
        workflowGet("/shops/stock"),
        workflowGet("/storage/records/dispatchable"),
      ]);
      setStock(result);
      setStorageRecords(storageList);
    } catch (err) {
      alert(err.message);
      setStorageRecords([]);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await workflowPost("/shops/distribute", {
        ...form,
        quantitySent: Number(form.quantitySent || 0),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      });
      alert("Shop distribution saved");
      loadStock();
    } catch (err) {
      alert(err.message);
    }
  };

  const chartData = {
    labels: stock.map((s) => s._id),
    datasets: [
      {
        data: stock.map((s) => s.totalSent),
        backgroundColor: ["#EC4899", "#F43F5E", "#FB7185", "#A855F7", "#06B6D4", "#14B8A6"],
      },
    ],
  };
  const doughnutOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Shop Distribution Report" },
    },
  };

  return (
    <div className="col-span-12 lg:col-span-10 p-4 bg-slate-100 min-h-screen flex flex-col gap-4">
      <div className="rounded-2xl p-6 text-white shadow bg-gradient-to-r from-pink-700 to-rose-500">
        <h2 className="text-2xl font-bold">Shop Distribution</h2>
        <p className="text-sm opacity-90">Dispatch finished goods and monitor stock sent per shop location.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {user?.role === "store_manager" ? (
          <form className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3" onSubmit={submit}>
            <h2 className="text-xl font-bold">Distribution Entry</h2>
            <select
              className="border p-2 rounded"
              value={form.storageRecordId}
              onChange={(e) => setForm({ ...form, storageRecordId: e.target.value })}
              required
            >
              <option value="" disabled>
                Select storage record
              </option>
              {storageRecords.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.quantityReceived} stored • remaining {s.remainingQty ?? "-"} • {new Date(s.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <select className="border p-2 rounded" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })}>
              <option>Lusaka</option>
              <option>Kitwe</option>
              <option>Solwezi</option>
              <option>Choma</option>
              <option>Chipata</option>
              <option>Individual Seller</option>
            </select>
            <input className="border p-2 rounded" placeholder="Quantity sent" value={form.quantitySent} onChange={(e) => setForm({ ...form, quantitySent: e.target.value })} required />
            <input className="border p-2 rounded" placeholder="Sizes (comma-separated)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} required />
            <textarea className="border p-2 rounded" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="bg-pink-600 text-white p-2 rounded" type="submit">Distribute to Shop</button>
          </form>
        ) : (
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold">Shop View</h2>
            <p className="text-sm text-gray-600 mt-1">
              Shops can only view stock/distribution information. Dispatch actions are restricted to Store Managers.
            </p>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-2">Stock Share by Shop</h3>
          <Doughnut data={chartData} options={doughnutOptions} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-2">Summary Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-700 mb-4">
          <p>Number of shop locations: <strong>{stock.length}</strong></p>
          <p>Total units distributed: <strong>{stock.reduce((sum, s) => sum + (s.totalSent || 0), 0)}</strong></p>
          <p>Top destination: <strong>{stock.length ? [...stock].sort((a, b) => b.totalSent - a.totalSent)[0]._id : "N/A"}</strong></p>
        </div>
        <h3 className="font-semibold mb-2">Available Stock by Shop</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Shop</th>
                <th className="py-2">Total Sent</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="py-2">{item._id}</td>
                  <td className="py-2">{item.totalSent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorkflowShop;
