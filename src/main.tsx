import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Helmet } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);

<Helmet>

<title>
Visa Americana en Guerrero | Asesores Migratorios
</title>

<meta
name="description"
content="Especialistas en visa americana, renovación, formulario DS-160, pasaporte mexicano y asesoría migratoria en Guerrero."
/>

<link
rel="canonical"
href="https://asesoresmigratoriosmx.com/"
/>

<meta property="og:type" content="website"/>

<meta
property="og:title"
content="Asesores Migratorios"
/>

<meta
property="og:description"
content="Especialistas en visas americanas y trámites migratorios."
/>

<meta
property="og:image"
content="https://asesoresmigratoriosmx.com/og-image.jpg"
/>

<meta
property="og:url"
content="https://asesoresmigratoriosmx.com/"
/>

<meta
name="twitter:card"
content="summary_large_image"
/>

<meta
name="twitter:title"
content="Asesores Migratorios"
/>

<meta
name="twitter:description"
content="Visa Americana y trámites migratorios."
/>

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"LegalService",
  "name":"Asesores Migratorios",
  "url":"https://asesoresmigratoriosmx.com",
  "telephone":"+527581000930",
  "address":{
    "@type":"PostalAddress",
    "addressLocality":"Tecpan de Galeana",
    "addressRegion":"Guerrero",
    "addressCountry":"MX"
  },
  "areaServed":"México"
}
</script>

</Helmet> 