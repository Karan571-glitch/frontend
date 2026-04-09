"use client";

import Link from "next/link";
import Image from "next/image";
import "./contact.css";

export default function ContactPage() {
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

            <form className="contactForm" onSubmit={(e) => e.preventDefault()}>
              <div className="twoCol">
                <label>
                  Full Name
                  <input type="text" placeholder="Your full name" />
                </label>
                <label>
                  Company
                  <input type="text" placeholder="Company name" />
                </label>
              </div>

              <div className="twoCol">
                <label>
                  Email
                  <input type="email" placeholder="name@company.com" />
                </label>
                <label>
                  Phone
                  <input type="text" placeholder="+1 (555) 000-0000" />
                </label>
              </div>

              <label>
                Message
                <textarea rows="5" placeholder="Tell us how we can help" />
              </label>

              <button type="submit">Submit Request</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
