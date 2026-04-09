"use client";

import AppShell from "@/app/components/appNavHead";
import "./help.css";

export default function HelpPage() {
  return (
    <AppShell>
      <div className="helpPage responsivePage">
        <section className="helpCard">
          <h1>Help Center</h1>
          <p>
            Welcome to support. If you need help with devices, firmware, sites, or users,
            contact your system administrator or operations support team.
          </p>

          <div className="helpList">
            <div className="helpItem">
              <h2>Common Questions</h2>
              <p>Check dashboard data, verify filters, and refresh the page after updates.</p>
            </div>

            <div className="helpItem">
              <h2>Technical Support</h2>
              <p>Email support@bluegiant.com or call +1 (800) 555-0100.</p>
            </div>

            <div className="helpItem">
              <h2>Account Access</h2>
              <p>Use the Profile and Settings pages to update your details and security options.</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
