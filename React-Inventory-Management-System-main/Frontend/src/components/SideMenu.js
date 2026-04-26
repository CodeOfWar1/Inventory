import React from "react";
import { Link } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorageData?.role || "";

  const canAccess = (allowedRoles) => allowedRoles.includes(role);
  const detailLinksByRole = {
    warehouse_manager: [
      { label: "Intake Details", to: "/workflow/details/warehouse_intakes" },
      { label: "Assignment Details", to: "/workflow/details/warehouse_assignments" },
      { label: "Storage Ready", to: "/workflow/details/storage_records" },
      { label: "Distributed", to: "/workflow/details/shop_stock" },
    ],
    designer: [
      { label: "Assignment Details", to: "/workflow/details/warehouse_assignments" },
      { label: "Output Details", to: "/workflow/details/designer_outputs" },
      { label: "Production Follow-up", to: "/workflow/details/production_batches" },
      { label: "Pipeline Completion", to: "/workflow/details/storage_records" },
    ],
    production_tracker: [
      { label: "Designer Outputs", to: "/workflow/details/designer_outputs" },
      { label: "Production Batches", to: "/workflow/details/production_batches" },
      { label: "Tailoring", to: "/workflow/details/tailoring_records" },
      { label: "Laundry", to: "/workflow/details/laundry_records" },
    ],
    tailor: [
      { label: "Production Batches", to: "/workflow/details/production_batches" },
      { label: "Tailoring Records", to: "/workflow/details/tailoring_records" },
      { label: "Laundry Handover", to: "/workflow/details/laundry_records" },
      { label: "Storage", to: "/workflow/details/storage_records" },
    ],
    laundry: [
      { label: "Tailoring Records", to: "/workflow/details/tailoring_records" },
      { label: "Laundry Records", to: "/workflow/details/laundry_records" },
      { label: "Storage Receipts", to: "/workflow/details/storage_records" },
      { label: "Shop Outputs", to: "/workflow/details/shop_stock" },
    ],
    store_manager: [
      { label: "Laundry Records", to: "/workflow/details/laundry_records" },
      { label: "Storage Records", to: "/workflow/details/storage_records" },
      { label: "Shop Stock", to: "/workflow/details/shop_stock" },
      { label: "Assignments", to: "/workflow/details/warehouse_assignments" },
    ],
    shop: [
      { label: "Storage Records", to: "/workflow/details/storage_records" },
      { label: "Shop Stock", to: "/workflow/details/shop_stock" },
      { label: "Laundry Flow", to: "/workflow/details/laundry_records" },
      { label: "Production", to: "/workflow/details/production_batches" },
    ],
    director: [
      { label: "Materials", to: "/workflow/details/warehouse_intakes" },
      { label: "Assignments", to: "/workflow/details/warehouse_assignments" },
      { label: "Production", to: "/workflow/details/production_batches" },
      { label: "Distribution", to: "/workflow/details/shop_stock" },
      { label: "Tailoring", to: "/workflow/details/tailoring_records" },
      { label: "Laundry", to: "/workflow/details/laundry_records" },
      { label: "Storage", to: "/workflow/details/storage_records" },
    ],
  };

  return (
    <div className="h-full flex-col justify-between  bg-white hidden lg:flex ">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700"
          >
            <img alt="dashboard-icon" src={require("../assets/dashboard-icon.png")} />
            <span className="text-sm font-medium"> Dashboard </span>
          </Link>

          {canAccess(["warehouse_manager"]) && (
            <Link to="/workflow/warehouse" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Warehouse Module
            </Link>
          )}
          {canAccess(["designer"]) && (
            <Link to="/workflow/designer" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Designer Module
            </Link>
          )}
          {canAccess(["production_tracker"]) && (
            <Link to="/workflow/production" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Production Tracking
            </Link>
          )}
          {canAccess(["tailor"]) && (
            <Link to="/workflow/tailoring" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Tailoring Module
            </Link>
          )}
          {canAccess(["laundry"]) && (
            <Link to="/workflow/laundry" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Laundry Module
            </Link>
          )}
          {canAccess(["store_manager"]) && (
            <Link to="/workflow/storage" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Storage Module
            </Link>
          )}
          {canAccess(["shop", "store_manager"]) && (
            <Link to="/workflow/shop" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Shop Distribution
            </Link>
          )}
          {role === "director" && (
            <Link to="/workflow/director" className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700 text-sm">
              Director Overview
            </Link>
          )}

          {(detailLinksByRole[role] || []).length > 0 && (
            <>
              <p className="px-4 pt-2 text-[11px] uppercase text-gray-400">Detailed Reports</p>
              {(detailLinksByRole[role] || []).map((d) => (
                <Link key={d.to} to={d.to} className="rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-600 text-sm">
                  {d.label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
          <img
            alt="Profile"
            src={localStorageData.imageUrl}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="text-xs">
              <strong className="block font-medium">
                {localStorageData.firstName + " " + localStorageData.lastName}
              </strong>

              <span> {localStorageData.email} </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
