import React, { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { workflowGet } from "../utils/workflowApi";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const roleThemes = {
  warehouse_manager: { title: "Warehouse Overview", accent: "from-blue-600 to-blue-500" },
  designer: { title: "Designer Overview", accent: "from-violet-600 to-purple-500" },
  production_tracker: { title: "Production Overview", accent: "from-orange-600 to-amber-500" },
  tailor: { title: "Tailoring Overview", accent: "from-emerald-600 to-green-500" },
  laundry: { title: "Laundry Overview", accent: "from-cyan-600 to-sky-500" },
  store_manager: { title: "Storage Overview", accent: "from-slate-700 to-slate-600" },
  shop: { title: "Shop Overview", accent: "from-pink-600 to-rose-500" },
  director: { title: "Director Overview", accent: "from-indigo-700 to-blue-600" },
};

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "director";
  const theme = roleThemes[role] || roleThemes.director;

  const [overview, setOverview] = useState(null);
  const [shopStock, setShopStock] = useState([]);
  const [chartView, setChartView] = useState("pipeline");

  useEffect(() => {
    const load = async () => {
      try {
        const [pipelineData, shopStockData] = await Promise.allSettled([
          workflowGet("/pipeline/overview"),
          workflowGet("/shops/stock"),
        ]);

        if (pipelineData.status === "fulfilled") {
          setOverview(pipelineData.value);
        }
        if (shopStockData.status === "fulfilled") {
          setShopStock(shopStockData.value);
        }
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, []);

  const metricCards = useMemo(() => {
    if (!overview) return [];
    const maps = {
      warehouse_manager: [
        { title: "Materials Received", value: overview.materials || 0, to: "/workflow/details/warehouse_intakes" },
        { title: "Rows Assigned", value: overview.assignments || 0, to: "/workflow/details/warehouse_assignments" },
        { title: "Storage Ready", value: overview.storageRecords || 0, to: "/workflow/details/storage_records" },
        { title: "Distributed", value: overview.shopDistributions || 0, to: "/workflow/details/shop_stock" },
      ],
      designer: [
        { title: "Assignments", value: overview.assignments || 0, to: "/workflow/details/warehouse_assignments" },
        { title: "Designer Outputs", value: overview.designerOutputs || 0, to: "/workflow/details/designer_outputs" },
        { title: "Production Follow-up", value: overview.productionBatches || 0, to: "/workflow/details/production_batches" },
        { title: "Pipeline Completion", value: overview.storageRecords || 0, to: "/workflow/details/storage_records" },
      ],
      production_tracker: [
        { title: "Designer Inputs", value: overview.designerOutputs || 0, to: "/workflow/details/designer_outputs" },
        { title: "Production Batches", value: overview.productionBatches || 0, to: "/workflow/details/production_batches" },
        { title: "Tailoring", value: overview.tailoringRecords || 0, to: "/workflow/details/tailoring_records" },
        { title: "Laundry", value: overview.laundryRecords || 0, to: "/workflow/details/laundry_records" },
      ],
      tailor: [
        { title: "Production Batches", value: overview.productionBatches || 0, to: "/workflow/details/production_batches" },
        { title: "Tailoring Records", value: overview.tailoringRecords || 0, to: "/workflow/details/tailoring_records" },
        { title: "Laundry Handover", value: overview.laundryRecords || 0, to: "/workflow/details/laundry_records" },
        { title: "Storage", value: overview.storageRecords || 0, to: "/workflow/details/storage_records" },
      ],
      laundry: [
        { title: "Tailoring Inputs", value: overview.tailoringRecords || 0, to: "/workflow/details/tailoring_records" },
        { title: "Laundry Records", value: overview.laundryRecords || 0, to: "/workflow/details/laundry_records" },
        { title: "Storage Receipts", value: overview.storageRecords || 0, to: "/workflow/details/storage_records" },
        { title: "Shop Outputs", value: overview.shopDistributions || 0, to: "/workflow/details/shop_stock" },
      ],
      store_manager: [
        { title: "Laundry Inputs", value: overview.laundryRecords || 0, to: "/workflow/details/laundry_records" },
        { title: "Stored Finished Goods", value: overview.storageRecords || 0, to: "/workflow/details/storage_records" },
        { title: "Shop Dispatches", value: overview.shopDistributions || 0, to: "/workflow/details/shop_stock" },
        { title: "Assignments", value: overview.assignments || 0, to: "/workflow/details/warehouse_assignments" },
      ],
      shop: [
        { title: "Total Shop Deliveries", value: overview.shopDistributions || 0, to: "/workflow/details/shop_stock" },
        { title: "Storage Records", value: overview.storageRecords || 0, to: "/workflow/details/storage_records" },
        { title: "Laundry Flow", value: overview.laundryRecords || 0, to: "/workflow/details/laundry_records" },
        { title: "Production", value: overview.productionBatches || 0, to: "/workflow/details/production_batches" },
      ],
      director: [
        { title: "Materials", value: overview.materials || 0, to: "/workflow/details/warehouse_intakes" },
        { title: "Assignments", value: overview.assignments || 0, to: "/workflow/details/warehouse_assignments" },
        { title: "Production", value: overview.productionBatches || 0, to: "/workflow/details/production_batches" },
        { title: "Distribution", value: overview.shopDistributions || 0, to: "/workflow/details/shop_stock" },
      ],
    };

    return maps[role] || maps.director;
  }, [overview]);

  const stageBarData = useMemo(() => {
    const labels = ["Materials", "Designer", "Production", "Tailoring", "Laundry", "Storage"];
    const values = overview
      ? [
          overview.materials || 0,
          overview.designerOutputs || 0,
          overview.productionBatches || 0,
          overview.tailoringRecords || 0,
          overview.laundryRecords || 0,
          overview.storageRecords || 0,
        ]
      : [0, 0, 0, 0, 0, 0];

    return {
      labels,
      datasets: [
        {
          label: "Records by Stage",
          data: values,
          backgroundColor: ["#2563EB", "#7C3AED", "#EA580C", "#16A34A", "#0284C7", "#475569"],
          borderRadius: 8,
        },
      ],
    };
  }, [overview]);

  const shopDoughnutData = useMemo(() => {
    const labels = shopStock.map((s) => s._id);
    const values = shopStock.map((s) => s.totalSent);
    return {
      labels: labels.length ? labels : ["No data"],
      datasets: [
        {
          label: "Shop Stock",
          data: values.length ? values : [1],
          backgroundColor: ["#2563EB", "#10B981", "#F97316", "#E11D48", "#7C3AED", "#06B6D4"],
        },
      ],
    };
  }, [shopStock]);

  const flowLineData = useMemo(() => {
    const labels = ["Assign", "Design", "Produce", "Tailor", "Laundry", "Store", "Distribute"];
    const values = overview
      ? [
          overview.assignments || 0,
          overview.designerOutputs || 0,
          overview.productionBatches || 0,
          overview.tailoringRecords || 0,
          overview.laundryRecords || 0,
          overview.storageRecords || 0,
          overview.shopDistributions || 0,
        ]
      : [0, 0, 0, 0, 0, 0, 0];

    return {
      labels,
      datasets: [
        {
          label: "Workflow Throughput",
          data: values,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [overview]);

  const renderRoleCharts = () => {
    if (role === "warehouse_manager") {
      return (
        <>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Material to Assignment Trend</h3>
            <Line data={flowLineData} />
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Stage Capacity</h3>
            <Bar data={stageBarData} />
          </div>
        </>
      );
    }

    if (role === "designer" || role === "production_tracker" || role === "tailor" || role === "laundry") {
      return (
        <>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Operational Flow Curve</h3>
            <Line data={flowLineData} />
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Workload by Stage</h3>
            <Bar data={stageBarData} />
          </div>
        </>
      );
    }

    if (role === "store_manager" || role === "shop") {
      return (
        <>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Distribution by Shop</h3>
            <Doughnut data={shopDoughnutData} />
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Supply Chain Throughput</h3>
            <Line data={flowLineData} />
          </div>
        </>
      );
    }

    return (
      <>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Production Stage Volume</h3>
          <Bar data={stageBarData} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Shop Distribution Split</h3>
          <Doughnut data={shopDoughnutData} />
        </div>
      </>
    );
  };

  const roleActions = {
    warehouse_manager: [
      { label: "Add Material Intake", to: "/workflow/warehouse" },
      { label: "Assign to Designers", to: "/workflow/warehouse" },
    ],
    designer: [
      { label: "Record Designer Output", to: "/workflow/designer" },
      { label: "View Production Flow", to: "/workflow/production" },
    ],
    production_tracker: [
      { label: "Record Production Batch", to: "/workflow/production" },
      { label: "Review Tailoring Stage", to: "/workflow/tailoring" },
    ],
    tailor: [
      { label: "Record Tailoring Batch", to: "/workflow/tailoring" },
      { label: "Send to Laundry", to: "/workflow/laundry" },
    ],
    laundry: [
      { label: "Record Laundry Output", to: "/workflow/laundry" },
      { label: "Hand Over to Storage", to: "/workflow/storage" },
    ],
    store_manager: [
      { label: "Record Storage Receipt", to: "/workflow/storage" },
      { label: "Dispatch to Shop", to: "/workflow/shop" },
    ],
    shop: [
      { label: "View Shop Distribution", to: "/workflow/shop" },
      { label: "Check Dashboard Status", to: "/" },
    ],
    director: [
      { label: "Open Director Overview", to: "/workflow/director" },
      { label: "Review Full Pipeline", to: "/" },
    ],
  };

  const highlights = [
    `Materials tracked: ${overview?.materials || 0}`,
    `Designer outputs captured: ${overview?.designerOutputs || 0}`,
    `Production batches recorded: ${overview?.productionBatches || 0}`,
    `Tailoring records: ${overview?.tailoringRecords || 0}`,
    `Laundry records: ${overview?.laundryRecords || 0}`,
    `Storage records: ${overview?.storageRecords || 0}`,
    `Shop distributions: ${overview?.shopDistributions || 0}`,
  ];

  return (
    <div className="col-span-12 lg:col-span-10 p-4 space-y-4 bg-slate-100 min-h-screen">
      <div className={`rounded-2xl p-6 text-white shadow bg-gradient-to-r ${theme.accent}`}>
        <h1 className="text-2xl font-bold">{theme.title}</h1>
        <p className="text-sm opacity-90 mt-1">
          Welcome {user?.firstName || "User"} - your dashboard is filtered by your role privileges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Link
            key={card.title}
            to={card.to || "#"}
            className={`bg-white rounded-xl border shadow-sm p-4 ${card.to ? "hover:border-blue-300 hover:shadow-md" : "pointer-events-none"}`}
          >
            <p className="text-xs uppercase text-gray-500">{card.title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
            {card.to && <p className="text-xs text-blue-600 mt-2">Open detailed page</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border shadow-sm p-4 xl:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Quick Actions</h3>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded text-xs ${chartView === "pipeline" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                onClick={() => setChartView("pipeline")}
              >
                Pipeline
              </button>
              <button
                className={`px-3 py-1 rounded text-xs ${chartView === "distribution" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                onClick={() => setChartView("distribution")}
              >
                Distribution
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(roleActions[role] || roleActions.director).map((action) => (
              <Link key={action.label} to={action.to} className="px-3 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-700">
                {action.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Operational Highlights</h3>
          <div className="space-y-2 max-h-36 overflow-auto pr-1">
            {highlights.map((item) => (
              <div key={item} className="text-sm text-gray-600 border-b pb-1">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {chartView === "pipeline" ? renderRoleCharts() : (
          <>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Distribution Split</h3>
              <Doughnut data={shopDoughnutData} />
            </div>
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Supply Flow</h3>
              <Line data={flowLineData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
