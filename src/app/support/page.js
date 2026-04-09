"use client";

import Link from "next/link";
import Image from "next/image";
import "./support.css";

const supportCards = [
  {
    title: "Blue Giant Parts",
    description:
      "Keep your equipment running strong with OEM parts built to fit right the first time.",
    href: "/contact",
  },
  {
    title: "Product Registration",
    description:
      "Register your product today to validate warranty and simplify future support requests.",
    href: "/contact",
  },
  {
    title: "Product Warranty",
    description:
      "Learn about warranty coverage and how we stand behind product quality and reliability.",
    href: "/contact",
  },
  {
    title: "Technical Support",
    description:
      "Our technical team is ready to assist with troubleshooting, service, and product questions.",
    href: "/contact",
  },
];

export default function SupportPage() {
  return (
    <div className="supportPage">
      <header className="supportHeader">
        <div className="supportHeaderInner">
          <Image
            src="/logo-white.svg"
            alt="Blue Giant Logo"
            className="supportLogo"
            width={180}
            height={45}
            priority
          />
          <nav className="supportNav">
            <Link href="/contact">Contact Us</Link>
            <Link href="/login">Login</Link>
          </nav>
        </div>
      </header>

      <main className="supportMain">
        <section className="supportHero">
          <p className="supportKicker">Support</p>
          <h1>We Are Here To Help</h1>
          <p>
            Get the most out of your Blue Giant products with support options for parts,
            registration, warranty, and technical guidance.
          </p>
        </section>

        <section className="supportGrid" aria-label="Support categories">
          {supportCards.map((card) => (
            <article key={card.title} className="supportCard">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link href={card.href} className="supportMore">
                More
              </Link>
            </article>
          ))}
        </section>

        <section className="supportAssist">
          <h2>Need Assistance?</h2>
          <p>
            Whether you need help with your order, product questions, or technical support,
            our dedicated team is ready to assist.
          </p>
          <Link href="/contact" className="supportButton">
            Contact Us
          </Link>
        </section>

        <footer className="supportFooter">
          Copyright 2026 © Blue Giant Equipment Corporation. All Rights Reserved.
        </footer>
      </main>
    </div>
  );
}
