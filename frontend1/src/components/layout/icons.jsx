// import logoImage from "../../assets/logo.png";

// export function BrandMark({ className = "h-5 w-5" }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={className}
//       aria-hidden="true"
//     >
//       <path d="M10 13.5 7.5 16a3.2 3.2 0 1 1-4.5-4.5l3.4-3.4a3.2 3.2 0 0 1 4.5 0" />
//       <path d="m14 10.5 2.5-2.5a3.2 3.2 0 0 1 4.5 4.5l-3.4 3.4a3.2 3.2 0 0 1-4.5 0" />
//       <path d="m8.5 15.5 7-7" />
//     </svg>
//   );
// }

// export function Logo({ size = "navbar", className = "" }) {
//   const iconSize = size === "navbar" ? "h-14 w-14" : size === "sidebar" ? "h-12 w-12" : "h-10 w-10";

//   return (
//     <img
//       src={logoImage}
//       alt="Clarior Logo"
//       className={`${iconSize} object-contain ${className}`}
//       style={{ backgroundColor: 'transparent' }}
//     />
//   );
// }




import logoImage from "../../assets/logo.png";

export function BrandMark({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13.5 7.5 16a3.2 3.2 0 1 1-4.5-4.5l3.4-3.4a3.2 3.2 0 0 1 4.5 0" />
      <path d="m14 10.5 2.5-2.5a3.2 3.2 0 0 1 4.5 4.5l-3.4 3.4a3.2 3.2 0 0 1-4.5 0" />
      <path d="m8.5 15.5 7-7" />
    </svg>
  );
}

// export function Logo({ size = "navbar", className = "" }) {
//   const iconSize =
//     size === "navbar"
//       ? "h-10 w-auto"
//       : size === "sidebar"
//       ? "h-12 w-auto"
//       : "h-8 w-auto";

//   return (
//     <img
//       src={logoImage}
//       alt="Clarior Logo"
//       className={`${iconSize} object-contain ${className}`}
//     />
//   );
// }


export function Logo({ size = "navbar", className = "" }) {
  const iconSize =
  size === "navbar"
    ? "h-10 max-w-[250px]"  // 👈 increased width
    : size === "sidebar"
    ? "h-12 max-w-[280px]"
    : "h-8 max-w-[180px]";
  return (
    <img
      src={logoImage}
      alt="Clarior Logo"
      className={`${iconSize} object-contain ${className}`}
    />
  );
}