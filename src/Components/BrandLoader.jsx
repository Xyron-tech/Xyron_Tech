import logo from "../assets/logo.webp";

export default function BrandLoader({label="Loading Xyron Wholesale"}){
  return <div className="brand-loader" role="status" aria-label={label}>
    <div className="brand-loader-mark" aria-hidden="true">
      <span className="brand-loader-ring"/>
      <img src={logo} alt=""/>
    </div>
    <span className="brand-loader-sr-only">{label}</span>
  </div>;
}
