import { Link } from "react-router-dom";
import { STORE_CONFIG } from "../config";
import { about } from "../data/siteContent";
import usePageMeta from "../hooks/usePageMeta";
import Img from "../components/Img";
import Reveal from "../components/Reveal";
import SectionTitle from "../components/SectionTitle";

export default function About() {
  usePageMeta(
    `About ${STORE_CONFIG.name} | Eyewear Store in Pakistan`,
    `Learn how ${STORE_CONFIG.name} chooses, checks and delivers premium eyewear across Pakistan.`
  );

  return (
    <>
      <header className="about-hero">
        <div className="container about-hero-inner">
          <div>
            <h1>{about.title}</h1>
            <p>{about.intro}</p>
            <div className="btn-row">
              <Link className="btn btn-primary" to="/products">Shop the collection</Link>
              <Link className="btn btn-outline" to="/contact">Visit a store</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="section container about-store" aria-labelledby="about-store-title">
        <SectionTitle id="about-store-title">Our store</SectionTitle>
        <p className="about-store-address">
          <span>{STORE_CONFIG.address}</span>
        </p>
        <div className="about-store-gallery">
          <figure className="about-store-photo">
            <Img src="/images/shop-1.jpg" alt="Interior view of The Optiks eyewear shop" />
          </figure>
          <figure className="about-store-photo">
            <Img src="/images/shop-3.jpg" alt="Eyewear displays inside The Optiks shop" />
          </figure>
        </div>
      </section>

      <section className="section container story" aria-labelledby="story-title">
        <div className="story-media">
          <Img src="/images/logo-small.png" alt={STORE_CONFIG.name} className="story-logo" />
        </div>
        <div className="story-copy">
          <SectionTitle id="story-title" align="left">Our story</SectionTitle>
          {about.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="section container" aria-labelledby="values-title">
        <SectionTitle id="values-title">What we stand for</SectionTitle>
        <Reveal as="ul" className="values">
          {about.values.map((v) => (
            <li key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="section section-stone" aria-labelledby="how-title">
        <div className="container">
          <SectionTitle id="how-title">How it works</SectionTitle>
          <ol className="how">
            {about.steps.map((s, i) => (
              <li key={s.title}>
                <span className="how-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cta-band" aria-label="Get started">
        <div className="container">
          <h2>Find the frame that feels like you.</h2>
          <div className="btn-row center-row">
            <Link className="btn btn-light" to="/products">Shop now</Link>
            <Link className="btn btn-ghost-light" to="/contact">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
