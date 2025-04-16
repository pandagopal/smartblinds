import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import VendorPortal from './vendor/VendorPortal';
import VendorAnalytics from './vendor/VendorAnalytics';
import ProductForm from './vendor/ProductForm';
import ProductConfigOptions from './vendor/ProductConfigOptions';
import ProductCatalog from './vendor/ProductCatalog';
import OrderManagement from './vendor/OrderManagement';
import OrderDetail from './vendor/OrderDetail';
import VendorDashboard from './dashboards/VendorDashboard';

const VendorRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/vendor" replace />} />
      <Route path="/dashboard" element={<VendorDashboard />} />
      <Route path="/portal" element={<VendorPortal />} />
      <Route path="/analytics" element={<VendorAnalytics />} />
      <Route path="/products" element={<ProductCatalog />} />
      <Route path="/products/new" element={<ProductForm />} />
      <Route path="/products/edit/:id" element={<ProductForm />} />
      <Route path="/products/configure/:id" element={<ProductConfigOptions />} />
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
    </Routes>
  );
};

export default VendorRouter;
