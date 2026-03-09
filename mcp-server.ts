import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "insightpulse-mcp",
  version: "1.0.0",
});

const overview = {
  healthScore: { score: 71, label: "Warning" },
  summary:
    "Marketing performance is showing signs of concern this week. Organic traffic declined significantly due to search ranking drops, and paid campaigns are seeing reduced efficiency. However, content marketing and referral channels are showing positive momentum that could be leveraged.",
  metrics: [
    { label: "Total Users", value: "24,812", change: "-8.3%" },
    { label: "Sessions", value: "41,293", change: "-5.1%" },
    { label: "Conversion Rate", value: "3.2%", change: "-0.4%" },
    { label: "Bounce Rate", value: "48.7%", change: "+6.2%" },
    { label: "Ad Spend", value: "$12,450", change: "-12%" },
    { label: "ROAS", value: "3.8x", change: "-8.5%" },
  ],
  channels: [
    { name: "Organic Search", value: 11240, change: "-22%" },
    { name: "Paid Search", value: 6830, change: "-14%" },
    { name: "Social (Paid)", value: 3210, change: "-12.8%" },
    { name: "Direct", value: 5120, change: "-3.4%" },
    { name: "Referral", value: 2890, change: "+2.8%" },
    { name: "Email", value: 1522, change: "+2.1%" },
  ],
  alerts: [
    {
      category: "critical",
      title: "Organic traffic down 22%",
      description:
        "Search impressions dropped significantly for several high-value keywords, resulting in fewer organic visits.",
    },
    {
      category: "warning",
      title: "Google Ads conversions dropped 18%",
      description:
        "Conversion volume decreased despite relatively stable click volume, suggesting landing page or targeting issues.",
    },
    {
      category: "warning",
      title: "Bounce rate increasing on landing pages",
      description:
        "Several key landing pages show bounce rates above 55%, up from 42% last period.",
    },
    {
      category: "opportunity",
      title: "Blog engagement growing",
      description:
        "Blog pages are receiving 18% more traffic with improving time-on-page metrics.",
    },
    {
      category: "stable",
      title: "Returning users remain consistent",
      description:
        "Returning visitor segment holds steady with no significant changes week-over-week.",
    },
  ],
  recommendedActions: [
    "Review SEO ranking changes in Search Console.",
    "Audit Google Ads landing pages for relevance and load speed issues.",
    "Increase budget allocation toward high-performing blog content.",
    "Review Meta Ads audience targeting to reduce CPA.",
    "Set up automated alerts for traffic drops exceeding 15%.",
  ],
};

function buildDiagnosticsReport() {
  return [
    "Marketing Performance Summary (Last 7 Days)",
    "",
    `Overall status: ${overview.healthScore.label}`,
    `Marketing Health Score: ${overview.healthScore.score} / 100`,
    "",
    "Key problems:",
    "- Organic traffic dropped by 22%",
    "- Google Ads conversions decreased by 18%",
    "- Bounce rate increased on landing pages",
    "",
    "Stable areas:",
    "- Returning users remain consistent",
    "- Referral traffic is stable",
    "",
    "Opportunities:",
    "- Blog engagement is growing",
    "- Some search queries show stronger CTR",
    "",
    "Recommended actions:",
    ...overview.recommendedActions.map((a) => `- ${a}`),
  ].join("\n");
}

server.registerTool(
  "get_marketing_overview",
  {
    title: "Get marketing overview",
    description:
      "Returns a high-level summary of marketing performance across all channels.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            overallStatus: overview.healthScore.label,
            healthScore: overview.healthScore,
            summary: overview.summary,
            metrics: overview.metrics,
            alerts: overview.alerts,
            recommendedActions: overview.recommendedActions,
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "analyze_traffic_sources",
  {
    title: "Analyze traffic sources",
    description:
      "Breaks down traffic by channel and highlights growth or decline trends.",
    inputSchema: {
      period: z.string().optional(),
    },
  },
  async ({ period }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            period: period ?? "last_7_days",
            channels: overview.channels,
            insight:
              "Organic and paid channels are declining, while referral and email remain stable or slightly positive.",
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "detect_traffic_anomalies",
  {
    title: "Detect traffic anomalies",
    description:
      "Detects unusual spikes or drops in traffic, engagement, or conversions.",
    inputSchema: {
      period: z.string().optional(),
    },
  },
  async ({ period }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            period: period ?? "last_7_days",
            anomalies: overview.alerts,
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "analyze_seo_performance",
  {
    title: "Analyze SEO performance",
    description:
      "Analyzes Search Console style SEO data and identifies issues and opportunities.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            impressions: 58200,
            clicks: 4240,
            ctr: "7.3%",
            avgPosition: 12.8,
            keyIssues: [
              "Search impressions declined for several high-value keywords.",
              "Some landing pages show lower CTR than expected.",
            ],
            opportunities: [
              "Blog pages are gaining traction and can be optimized for conversion.",
              "Queries with improving CTR should be supported with stronger landing pages.",
            ],
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "analyze_paid_ads_performance",
  {
    title: "Analyze paid ads performance",
    description:
      "Evaluates Google Ads and Meta Ads campaigns, efficiency, and conversion performance.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            googleAds: {
              spend: "$7,450",
              conversions: 182,
              cpc: "$1.92",
              roas: "3.4x",
              issue: "Conversions are down despite relatively stable click volume.",
            },
            metaAds: {
              spend: "$5,000",
              conversions: 96,
              cpa: "$52.08",
              ctr: "1.9%",
              issue: "CPA is rising, suggesting audience fatigue or weaker creative relevance.",
            },
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "analyze_landing_pages",
  {
    title: "Analyze landing pages",
    description:
      "Identifies landing pages with performance issues or optimization opportunities.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            pages: [
              {
                page: "/landing/ai-marketing-diagnostics",
                bounceRate: "56%",
                conversionRate: "2.1%",
                note: "High bounce rate suggests mismatch between ad promise and page content.",
              },
              {
                page: "/blog/marketing-diagnostics-guide",
                bounceRate: "39%",
                conversionRate: "1.4%",
                note: "Strong engagement; add clearer CTAs to capture demand.",
              },
            ],
            recommendations: [
              "Improve page speed on high-spend landing pages.",
              "Strengthen message match between paid ads and landing page headlines.",
              "Add stronger CTAs on high-engagement blog pages.",
            ],
          },
          null,
          2
        ),
      },
    ],
  })
);

server.registerTool(
  "generate_diagnostics_report",
  {
    title: "Generate diagnostics report",
    description:
      "Generates a clear human-readable marketing analysis report for managers and marketers.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: buildDiagnosticsReport(),
      },
    ],
  })
);

server.registerTool(
  "calculate_health_score",
  {
    title: "Calculate health score",
    description:
      "Calculates the overall Marketing Health Score and explains the main drivers.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            score: overview.healthScore.score,
            label: overview.healthScore.label,
            rationale: [
              "Organic traffic decline has the largest negative impact.",
              "Paid ads conversion efficiency is weaker than the previous period.",
              "Referral and returning-user stability partially offsets the decline.",
            ],
          },
          null,
          2
        ),
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
