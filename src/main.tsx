import './index.css'

const root = document.getElementById('root')!

const painted = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 2000)
    if (!PerformanceObserver.supportedEntryTypes.includes('paint')) return resolve()
    new PerformanceObserver((list, observer) => {
      if (!list.getEntriesByName('first-contentful-paint').length) return
      observer.disconnect()
      resolve()
    }).observe({ type: 'paint', buffered: true })
  })

if (root.dataset.cats && document.documentElement.dataset.prerender !== 'hidden') await painted()
const { mount } = await import('./app/mount')
await mount(root)
