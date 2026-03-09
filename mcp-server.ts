import http from 'http';

/*
 * InsightPulse MCP Server
 *
 * This is a simple HTTP server that exposes a handful of endpoints
 * corresponding to the MCP tools described in the user interface.  It
 * doesn’t connect to any real data sources (Google Analytics,
 * Search Console, Google Ads or Meta Ads); instead it serves a set of
 * mock values that match the components defined in the existing
 * dashboard UI (see Index.tsx).  Each endpoint returns JSON data so
 * that an AI agent or any HTTP client can retrieve structured
 * diagnostics about marketing performance.  The structure of these
 * responses was inspired by the prompts and comments throughout the
 * conversation: overall health scoring, anomaly detection, SEO and
 * paid ads analysis, landing‐page insights and a human‑readable
 * diagnostics report.
 *
 * To run this server locally you can execute `node mcp-server.ts` with
 * ts-node or transpile it to JavaScript.  The server listens on
 * PORT=3000 by default or any port defined via the PORT environment
 * variable.  For production use you would replace the mock values
 * with real API calls to GA4, GSC, Google Ads and Meta Ads via
 * OAuth‑authenticated clients.
 */

// Define the shape of our mock marketing overview.  In a real system
// you would fetch these values from your analytics providers.
interface HealthScore {
  score: number;
  label: string;
}

interface Metric {
  label: string;
  value: number;
  change: number; // percentage change (e.g. -0.18 for −18 %)
}

interface ChannelMetric {
  name: string;
  value: number;
  change: number;
}

interface OverviewData {
  healthScore: HealthScore;
  summary: string;
  metrics: Metric[];
  channels: ChannelMetric[];
  recommendedActions: string[];
}

// A mock overview derived from the UI demo.  Feel free to adjust the
// numbers to better reflect your actual marketing state.
const overview: OverviewData = {
  healthScore: { score: 71, label: 'Warning' },
  summary:
    'Organic traffic decreased by 22 % and Google Ads conversions dropped by 18 % while bounce rates increased on several landing pages. Returning users and referral traffic remain stable.',
  metrics: [
    { label: 'Users', value: 13250, change: -0.05 },
    { label: 'Sessions', value: 15680, change: -0.04 },
    { label: 'Conversion Rate', value: 0.023, change: -0.18 },
    { label: 'Bounce Rate', value: 0.55, change: 0.30 },
    { label: 'Avg. Session Duration', value: 192, change: -0.02 },
    { label: 'Pages per Session', value: 3.1, change: 0.03 },
  ],
  channels: [
    { name: 'Organic', value: 7200, change: -0.22 },
    { name: 'Paid Search', value: 4200, change: -0.12 },
    { name: 'Referral', value: 1800, change: 0.05 },
    { name: 'Direct', value: 2450, change: -0.03 },
  ],
  recommendedActions: [
    'Review SEO ranking changes for your primary keywords.',
    'Check paid campaign budgets and targeting settings.',
    'Analyze landing page load speed and content relevance.',
  ],
};

// Generate a diagnostics report summarising the state of marketing
// performance.  This string should be human‑readable and is meant
// primarily for managers and non‑specialists, echoing the
// recommendations given in the demo UI.
function generateDiagnosticsReport(): string {
  return [
    'Marketing Performance Summary (Last 7 Days)\n',
    `Health Score: ${overview.healthScore.score} / 100 (${overview.healthScore.label})`,
    '',
    'Key issues detected:',
    '• Organic traffic dropped by 22 %',
    '• Google Ads conversions decreased by 18 %',
    '• Bounce rates increased on landing pages',
    '',
    'Possible causes:',
    '• Decline in search impressions for important keywords',
    '• Reduced advertising activity or budget changes',
    '• Landing page relevance or performance issues',
    '',
    'Stable areas:',
    '• Returning users are consistent',
    '• Referral traffic is steady',
    '',
    'Growth opportunities:',
    '• Blog engagement is growing with increased time on page',
    '• Certain search queries show higher CTRs and can be targeted',
    '',
    'Recommended actions:',
    ...overview.recommendedActions.map((a) => `• ${a}`),
  ].join('\n');
}

// Helper to send JSON responses with proper headers.
function sendJson(res: http.ServerResponse, body: any): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// Helper to strip query strings from the URL.  This allows calls like
// `/detect_traffic_anomalies?days=7` to still match the correct
// endpoint.
function stripQuery(path?: string | null): string {
  if (!path) return '';
  const idx = path.indexOf('?');
  return idx >= 0 ? path.substring(0, idx) : path;
}

// A simple HTTP server dispatching requests to different tool
// handlers based on the request URL.  Each tool returns a JSON
// structure.  In the future you could enrich these handlers to
// accept parameters (e.g. `?days=30`) and pull real data.
const server = http.createServer((req, res) => {
  const path = stripQuery(req.url);
  // Enable CORS for local testing and integration with front‑end apps.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  switch (path) {
    case '/get_marketing_overview':
      sendJson(res, overview);
      break;
    case '/analyze_traffic_sources':
      // Break down traffic by channel including trend detection
      sendJson(res, {
        period: 'last_7_days',
        channels: overview.channels.map((c) => ({
          name: c.name,
          traffic: c.value,
          change: c.change,
          trend: c.change > 0 ? 'up' : c.change < 0 ? 'down' : 'stable',
        })),
      });
      break;
    case '/detect_traffic_anomalies':
      // Simple anomaly detection returning a list of anomalies
      sendJson(res, {
        anomalies: [
          {
            metric: 'Organic traffic',
            change: -0.22,
            severity: 'critical',
            description: 'Organic traffic dropped significantly relative to the previous period.',
          },
          {
            metric: 'Paid conversions',
            change: -0.18,
            severity: 'warning',
            description: 'Conversions from paid campaigns declined despite stable clicks.',
          },
          {
            metric: 'Bounce rate',
            change: 0.30,
            severity: 'warning',
            description: 'Bounce rates on landing pages increased markedly.',
          },
        ],
      });
      break;
    case '/analyze_seo_performance':
      // Mock Search Console analysis including impressions, clicks, CTR and average position
      sendJson(res, {
        period: 'last_7_days',
        impressions: 58000,
        clicks: 4200,
        ctr: 4200 / 58000,
        avgPosition: 18.4,
        topQueries: [
          { query: 'ai marketing analytics', impressions: 8000, clicks: 600, ctr: 0.075, position: 4.1 },
          { query: 'marketing diagnostics tool', impressions: 6500, clicks: 390, ctr: 0.06, position: 7.8 },
          { query: 'growth opportunity analysis', impressions: 5200, clicks: 260, ctr: 0.05, position: 9.2 },
        ],
        issues: [
          { page: '/pricing', issue: 'High bounce rate and low dwell time' },
          { page: '/landing-ai-tool', issue: 'CTR declining for primary keywords' },
        ],
      });
      break;
    case '/analyze_paid_ads_performance':
      // Combined analysis of Google Ads and Meta Ads campaigns
      sendJson(res, {
        period: 'last_7_days',
        campaigns: [
          {
            platform: 'Google Ads',
            name: 'Brand Search',
            spend: 950.0,
            conversions: 120,
            cpc: 950.0 / 4000,
            roas: 4.2,
            status: 'active',
          },
          {
            platform: 'Google Ads',
            name: 'Competitor Campaign',
            spend: 450.0,
            conversions: 32,
            cpc: 450.0 / 1500,
            roas: 2.7,
            status: 'paused',
          },
          {
            platform: 'Meta Ads',
            name: 'Lookalike Audience',
            spend: 600.0,
            conversions: 68,
            cpa: 600.0 / 68,
            ctr: 0.021,
            status: 'active',
          },
        ],
      });
      break;
    case '/analyze_landing_pages':
      // Basic landing page performance analysis
      sendJson(res, {
        period: 'last_7_days',
        pages: [
          { url: '/landing-ai-tool', sessions: 2100, bounceRate: 0.58, conversionRate: 0.015 },
          { url: '/pricing', sessions: 3200, bounceRate: 0.62, conversionRate: 0.012 },
          { url: '/blog/marketing-insights', sessions: 1800, bounceRate: 0.42, conversionRate: 0.021 },
          { url: '/signup', sessions: 4000, bounceRate: 0.35, conversionRate: 0.045 },
        ],
        opportunities: [
          'Improve page load speed on the /pricing page to reduce bounce rate.',
          'Test different headlines and CTAs on /landing-ai-tool to boost engagement.',
          'Leverage growing interest in blog posts by adding conversion pathways.',
        ],
      });
      break;
    case '/generate_diagnostics_report':
      sendJson(res, { report: generateDiagnosticsReport() });
      break;
    case '/calculate_health_score':
      // Return a computed health score and high‑level reasons.  In the
      // future this could incorporate weighted scoring across many
      // metrics and channels.
      sendJson(res, {
        score: overview.healthScore.score,
        label: overview.healthScore.label,
        rationale: [
          'Organic traffic drop (−22 %) has a high impact on overall health.',
          'Paid conversions decline (−18 %) contributes negatively.',
          'Stable returning users and referral traffic provide a buffer.',
        ],
      });
      break;
    default:
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
      break;
  }
});

// Start the server if this module is executed directly.  This check
// allows the functions to be imported by other modules (for example
// unit tests) without immediately starting a listening server.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`InsightPulse MCP server running on port ${port}`);
  });
}

export default server;