import React from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Inventory from "./pages/Inventory";
import NoPageFound from "./pages/NoPageFound";
import AuthContext from "./AuthContext";
import ProtectedWrapper from "./ProtectedWrapper";
import { useState } from "react";
import Store from "./pages/Store";
import Sales from "./pages/Sales";
import PurchaseDetails from "./pages/PurchaseDetails";
import WorkflowWarehouse from "./pages/WorkflowWarehouse";
import WorkflowDesigner from "./pages/WorkflowDesigner";
import WorkflowProduction from "./pages/WorkflowProduction";
import WorkflowTailoring from "./pages/WorkflowTailoring";
import WorkflowLaundry from "./pages/WorkflowLaundry";
import WorkflowStorage from "./pages/WorkflowStorage";
import WorkflowShop from "./pages/WorkflowShop";
import WorkflowDirector from "./pages/WorkflowDirector";
import RoleProtectedRoute from "./RoleProtectedRoute";
import WorkflowDetailPage from "./pages/WorkflowDetailPage";
import AuthProvider from "./AuthProvider";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedWrapper>
                <Layout />
              </ProtectedWrapper>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchase-details" element={<PurchaseDetails />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/manage-store" element={<Store />} />
            <Route
              path="/workflow/warehouse"
              element={
                <RoleProtectedRoute allowedRoles={["warehouse_manager"]}>
                  <WorkflowWarehouse />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/designer"
              element={
                <RoleProtectedRoute allowedRoles={["designer"]}>
                  <WorkflowDesigner />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/production"
              element={
                <RoleProtectedRoute allowedRoles={["production_tracker"]}>
                  <WorkflowProduction />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/tailoring"
              element={
                <RoleProtectedRoute allowedRoles={["tailor"]}>
                  <WorkflowTailoring />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/laundry"
              element={
                <RoleProtectedRoute allowedRoles={["laundry"]}>
                  <WorkflowLaundry />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/storage"
              element={
                <RoleProtectedRoute allowedRoles={["store_manager"]}>
                  <WorkflowStorage />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/shop"
              element={
                <RoleProtectedRoute allowedRoles={["shop", "store_manager"]}>
                  <WorkflowShop />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/director"
              element={
                <RoleProtectedRoute allowedRoles={["director"]}>
                  <WorkflowDirector />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/workflow/details/:detailKey"
              element={
                <RoleProtectedRoute
                  allowedRoles={[
                    "warehouse_manager",
                    "designer",
                    "production_tracker",
                    "tailor",
                    "laundry",
                    "store_manager",
                    "shop",
                    "director",
                  ]}
                >
                  <WorkflowDetailPage />
                </RoleProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<NoPageFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
