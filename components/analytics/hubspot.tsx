import Script from 'next/script'

export const Hubspot = () => {
  return <Script src="https://js-eu1.hs-scripts.com/143255669.js" />
}

export const hsPageView = (path: string) => {
  if (window._hsq) {
    window._hsq.push(['setPath', path])
  }
}
