import { useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";

const teamLeads = [
  {
    name: "Dr. Manish Agrawal",
    image: "/assets/Photos/manish.png",
    role: "Faculty Coordinator",
    dept: "USF College of Business",
    link: "https://www.usf.edu/business/about/bios/agrawal-manish.aspx",
  },
  {
    name: "Dr. Shivendu Shivendu",
    image: "/assets/Photos/shivendu-shivendu.jpg",
    role: "Faculty Coordinator",
    dept: "USF College of Business",
    link: "https://www.usf.edu/business/about/bios/shivendu-shivendu.aspx",
  },
];

const studentVolunteers = {
  2025: [
    { name: "Shlok Goud", role: "MS AIBA 2026", image: "/assets/Photos/shlok_goud.jpg" },
    { name: "Sohan Vasudeva", role: "MS AIBA 2026", image: "/assets/Photos/sohan.jpg" },
    { name: "Sonal Shreya", role: "MS AIBA 2026", image: "/assets/Photos/sonal.jpg" },
    { name: "Aditi Malik", role: "MS AIBA 2027", image: "/assets/Photos/aditi-malik.jpg" },
    { name: "Venkata Lokesh Adda", role: "MS AIBA 2026", image: "/assets/Photos/lokesh.jpg" },
    { name: "Jacqueline Lapacek", role: "MS AIBA 2026", image: "/assets/Photos/jackie.jpg" },
  ],
  2024: [
    { name: "Nikita Gill", role: "MS AIBA 2025", image: "/assets/Photos/nikita-gill.jpg" },
    { name: "Nidhi Falak", role: "MS AIBA 2025", image: "/assets/Photos/nidhi-falak.jpg" },
    { name: "Alvaro Ruiz", role: "MS AIBA 2026", image: "/assets/Photos/alvaro-montoya-ruiz.jpg" },
    { name: "Priyanka Jammu", role: "MS AIBA 2026", image: "/assets/Photos/priyanka-jammu.jpg" },
  ],
};

const CITATION =
  'Agrawal, M., & Shivendu, S. (2025). Regional Macro-Economic Insights: Regional Vitality in America. University of South Florida. https://www.usf.edu';

const AFFILIATIONS = [
  "USF Muma College of Business",
  "Department of Information Systems & Decision Sciences",
  "State of the Region Initiative",
];

const About = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(CITATION);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const renderTeamCard = (member, key) => {
    const content = (
      <>
        <div className="team-photo">
          <img src={member.image} alt={member.name} />
        </div>
        <div className="team-name">{member.name}</div>
        <div className="team-role">{member.role}</div>
        <div className="team-dept">{member.dept || "Muma College of Business"}</div>
      </>
    );

    if (member.link) {
      return (
        <a
          key={key}
          href={member.link}
          target="_blank"
          rel="noopener noreferrer"
          className="team-card team-card--link"
        >
          {content}
        </a>
      );
    }

    return (
      <div key={key} className="team-card">
        {content}
      </div>
    );
  };

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About this project</h1>
          <p>
            Regional Macro-Economic Insights is a research initiative at the
            University of South Florida that tracks and publishes data on economic
            vitality across US metro regions. Our goal is to make regional data
            accessible, credible, and useful for decision-makers, researchers,
            and the public.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title team-title">The team</h2>
          <p className="team-intro">
            Faculty coordinators and graduate student contributors at the Muma
            College of Business build and maintain the platform.
          </p>
          <div className="team-grid">
            {teamLeads.map((member) => renderTeamCard(member, member.name))}
            {studentVolunteers[2025].map((member) =>
              renderTeamCard(member, member.name)
            )}
          </div>

          <h3 className="team-year-label">2024 contributors</h3>
          <div className="team-grid team-grid--alumni">
            {studentVolunteers[2024].map((member) =>
              renderTeamCard(member, member.name)
            )}
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <h2 className="section-title bg-title">Background</h2>
          <div className="bg-grid">
            <div>
              <p className="bg-text">
                This project began as part of a graduate research seminar focused
                on regional economic vitality in the post-pandemic era, originally
                developed as a benchmarking tool for the Tampa Bay area.
              </p>
              <p className="bg-text">
                The platform was developed to fill a gap in publicly accessible,
                independently produced data on how US metro regions compare —
                bringing together federal datasets that are technically public but
                practically difficult to access and interpret.
              </p>
            </div>
            <div className="affiliation-box">
              <div className="affiliation-box-label">Affiliated with</div>
              {AFFILIATIONS.map((item) => (
                <div key={item} className="affiliation-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title cite-title">Citing this work</h2>
          <div className="cite-box">
            <div className="cite-box-label">Suggested citation (APA)</div>
            <div className="cite-text">
              Agrawal, M., &amp; Shivendu, S. (2025).{" "}
              <em>
                Regional Macro-Economic Insights: Regional Vitality in America.
              </em>{" "}
              University of South Florida. https://www.usf.edu
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleCopyCitation}
          >
            {copied ? "Copied!" : "Copy citation"}
          </button>
        </div>
      </section>

      <section className="section section-muted" id="contact">
        <div className="container">
          <h2 className="section-title contact-title">Contact</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <p>
                Questions about the data, methodology, or the project? We welcome
                feedback from researchers, policymakers, and the public.
              </p>
              <div className="contact-detail">
                ✉{" "}
                <a href="mailto:insights@usf.edu">insights@usf.edu</a>
              </div>
              <div className="contact-detail contact-detail-muted">
                📍 4202 E. Fowler Avenue, BSN 3403, Tampa, FL 33620
              </div>
              <div className="contact-detail contact-detail-muted">
                ☎ 813-974-4281
              </div>
            </div>
            <div className="contact-form-mock">
              <div className="form-field">
                <label htmlFor="contact-name">Name</label>
                <input id="contact-name" type="text" placeholder="Your name" />
              </div>
              <div className="form-field">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" type="email" placeholder="your@email.com" />
              </div>
              <div className="form-field">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" placeholder="Your message…" />
              </div>
              <button type="button" className="btn btn-primary btn-full">
                Send message
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">Regional Macro-Economic Insights</div>
            <div className="footer-sub">
              University of South Florida · © 2025
            </div>
          </div>
          <div className="footer-links">
            <Link to="/methodology">Methodology</Link>
            <a href="#contact">Contact</a>
            <button type="button" className="footer-link-btn" onClick={handleCopyCitation}>
              Cite this work
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
