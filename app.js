const routes = {
  '/':                   'content/home.md',
  '/deployments':        'content/deployments.md',
  '/preview-deployments':'content/preview-deployments.md',
  '/git-integration':    'content/git-integration.md',
  '/cli':                'content/cli.md',
  '/domains':            'content/domains.md',
  '/functions':          'content/functions.md',
  '/edge-functions':     'content/edge-functions.md',
  '/fluid-compute':      'content/fluid-compute.md',
  '/nextjs':             'content/nextjs.md',
  '/framework-support':  'content/framework-support.md',
  '/cdn':                'content/cdn.md',
  '/image-optimization': 'content/image-optimization.md',
  '/isr':                'content/isr.md',
  '/caching':            'content/caching.md',
  '/blob':               'content/blob.md',
  '/kv':                 'content/kv.md',
  '/postgres':           'content/postgres.md',
  '/ai-sdk':             'content/ai-sdk.md',
  '/ai-gateway':         'content/ai-gateway.md',
  '/v0':                 'content/v0.md',
  '/waf':                'content/waf.md',
  '/ddos':               'content/ddos.md',
  '/bot-management':     'content/bot-management.md',
  '/web-analytics':      'content/web-analytics.md',
  '/speed-insights':     'content/speed-insights.md',
  '/logs':               'content/logs.md',
  '/toolbar':            'content/toolbar.md',
  '/feature-flags':      'content/feature-flags.md',
  '/monorepos':          'content/monorepos.md',
};

const STUB = (name) => `# ${name}\n\nThis page is coming soon.\n`;

async function loadPage(path) {
  const article = document.getElementById('content');
  const file = routes[path];

  article.innerHTML = '<div class="loading">Loading\u2026</div>';

  let text;
  if (!file) {
    text = STUB(path.replace('/', '').replace(/-/g, ' '));
  } else {
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error('not found');
      text = await res.text();
    } catch {
      text = STUB(path.replace('/', '').replace(/-/g, ' '));
    }
  }

  article.innerHTML = marked.parse(text);

  // Scroll to top
  window.scrollTo(0, 0);

  // Update active nav link
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href').replace(/^#/, '');
    a.classList.toggle('active', href === path || (path === '/' && href === '/'));
  });
}

function currentPath() {
  const hash = location.hash.replace(/^#/, '').trim();
  return hash || '/';
}

window.addEventListener('hashchange', () => loadPage(currentPath()));
window.addEventListener('DOMContentLoaded', () => loadPage(currentPath()));
