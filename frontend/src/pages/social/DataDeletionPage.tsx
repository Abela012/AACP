import React from 'react';
import { Shield, Mail, Trash2, Link2, Clock, CheckCircle } from 'lucide-react';

const DataDeletionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-3xl font-bold tracking-tight">Facebook Data Deletion Instructions</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Complete transparency and control over your connected data.
          </p>
        </div>

        <div className="px-8 py-10 space-y-10">
          {/* Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
              Requesting Data Deletion
            </h2>
            <p className="text-slate-600 leading-relaxed">
              In compliance with Facebook's platform policies, we provide a clear path for users to request the deletion of their Facebook-connected data from our application. When you connect your Facebook account, we may store certain information to provide our services. You have the right to request the removal of this data at any time.
            </p>
          </section>

          {/* Disconnect Instructions */}
          <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2 mb-3">
              <Link2 className="w-5 h-5 text-blue-600" />
              How to Disconnect
            </h3>
            <p className="text-slate-600 mb-4">
              You can disconnect your Facebook account directly from within your application settings:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 ml-2">
              <li>Log in to your account.</li>
              <li>Navigate to <strong>Account Settings</strong> or <strong>Profile Edit</strong>.</li>
              <li>Find the <strong>Social Connections</strong> section.</li>
              <li>Click on the <strong>Disconnect Facebook</strong> button.</li>
            </ol>
          </section>

          {/* Support Contact */}
          <section>
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              Manual Deletion Request
            </h3>
            <p className="text-slate-600 mb-4">
              If you cannot access your account or wish to request manual deletion, please contact our support team with your registered email address or Facebook User ID:
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="font-medium text-blue-900">Email: support@aacp.com</p>
              <p className="text-blue-700 text-sm mt-1">Please include "Facebook Data Deletion Request" in the subject line.</p>
            </div>
          </section>

          {/* Service Level Statement */}
          <section className="flex items-start gap-4 p-5 bg-green-50 rounded-xl border border-green-100">
            <Clock className="w-6 h-6 text-green-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">Deletion Timeline</h3>
              <p className="text-green-800 mt-1">
                Once a request is received and verified, all Facebook-related access tokens, personal identifiers, and cached metadata will be permanently deleted from our databases within <strong>7 business days</strong>.
              </p>
            </div>
          </section>

          {/* Footer Statement */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>We prioritize your privacy and data security.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionPage;
