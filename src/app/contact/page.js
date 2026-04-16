"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import "./contact.css";

export default function ContactPage() {
  const [form, setForm] = useState({ fullName: "", company: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    else if (form.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Please enter a valid email address.";
    if (form.phone.trim() && !/^[+\d\s\-().]{7,20}$/.test(form.phone.trim())) errs.phone = "Please enter a valid phone number.";
    if (!form.message.trim()) errs.message = "Message is required.";
    else if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  const errStyle = { color: "#DC2626", fontSize: "12px", marginTop: "4px", display: "block" };
  const inputBorder = (field) => errors[field] ? "1px solid #DC2626" : undefined;
  return (
    <div className="contactPage">
      <header className="contactHeader">
        <div className="headerInner">
          <Image
            src="/logo-white.svg"
            alt="Blue Giant Logo"
            className="headerLogo"
            width={180}
            height={45}
            priority
          />
          <nav className="headerNav">
            <Link href="/login">Login</Link>
            <Link href="/support">Support</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="heroSection">
          <p className="heroKicker">Contact Us</p>
          <h1>Ready to Optimize Your Operations?</h1>
          <p>
            Reach our team for product guidance, technical support, or consultation.
            We will connect you with the right specialist for your facility.
          </p>
        </section>

        <section className="contactGrid">
          <article className="infoCard">
            <h2>Corporate Office</h2>
            <p>410 Admiral Boulevard, Mississauga, ON, Canada</p>
            <p><strong>Phone:</strong> +1 (905) 457-3900</p>
            <p><strong>Email:</strong> info@bluegiant.com</p>
          </article>

          <article className="infoCard">
            <h2>Sales & Consultation</h2>
            <p>Discuss your dock equipment and ergonomics requirements.</p>
            <p><strong>Email:</strong> sales@bluegiant.com</p>
            <p><strong>Hours:</strong> Monday to Friday, 8:00 AM - 6:00 PM</p>
          </article>

          <article className="infoCard">
            <h2>Aftermarket Support</h2>
            <p>Need service parts, upgrades, or maintenance help?</p>
            <p><strong>Email:</strong> aftermarket@bluegiant.com</p>
            <p><strong>Phone:</strong> +1 (800) 872-2583</p>
          </article>
        </section>

        <section className="formSection">
          <div className="formCard">
            <h2>Send Us a Message</h2>
            <p>Complete this form and our team will reply shortly.</p>

            {submitted ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#15803D", fontWeight: 600, fontSize: "16px" }}>
                ✓ Thank you! Your message has been sent. We will be in touch shortly.
              </div>
            ) : (
              <form className="contactForm" onSubmit={handleSubmit} noValidate>
                <div className="twoCol">
                  <label>
                    Full Name <span style={{ color: "#DC2626" }}>*</span>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      style={{ border: inputBorder("fullName") }}
                    />
                    {errors.fullName && <span style={errStyle}>{errors.fullName}</span>}
                  </label>
                  <label>
                    Company
                    <input
                      type="text"
                      placeholder="Company name"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                    />
                  </label>
                </div>

                <div className="twoCol">
                  <label>
                    Email <span style={{ color: "#DC2626" }}>*</span>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      style={{ border: inputBorder("email") }}
                    />
                    {errors.email && <span style={errStyle}>{errors.email}</span>}
                  </label>
                  <label>
                    Phone
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      style={{ border: inputBorder("phone") }}
                    />
                    {errors.phone && <span style={errStyle}>{errors.phone}</span>}
                  </label>
                </div>

                <label>
                  Message <span style={{ color: "#DC2626" }}>*</span>
                  <textarea
                    rows="5"
                    placeholder="Tell us how we can help"
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    style={{ border: inputBorder("message") }}
                  />
                  {errors.message && <span style={errStyle}>{errors.message}</span>}
                </label>

                <button type="submit">Submit Request</button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
