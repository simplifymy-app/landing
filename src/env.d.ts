// Vite's ?inline suffix resolves an asset to a data: URI string. Astro's own image types
// cover a bare .png import, not this one, so it is declared here.
declare module '*.png?inline' {
  const dataUri: string;
  export default dataUri;
}
