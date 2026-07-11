export interface CompanyNormalizationResult {
  normalizedName: string;
  normalizedDomain: string | null;
  aliases: string[];
  isKnownCompany: boolean;
  mergedCompanyId: string | null;
}

export interface CompanyAlias {
  alias: string;
  canonicalName: string;
  domain: string | null;
}

const KNOWN_COMPANY_ALIASES: CompanyAlias[] = [
  { alias: 'google', canonicalName: 'Google', domain: 'google.com' },
  { alias: 'alphabet', canonicalName: 'Google', domain: 'google.com' },
  { alias: 'google llc', canonicalName: 'Google', domain: 'google.com' },
  { alias: 'meta', canonicalName: 'Meta', domain: 'meta.com' },
  { alias: 'facebook', canonicalName: 'Meta', domain: 'meta.com' },
  { alias: 'facebook inc', canonicalName: 'Meta', domain: 'meta.com' },
  { alias: 'meta platforms', canonicalName: 'Meta', domain: 'meta.com' },
  { alias: 'amazon', canonicalName: 'Amazon', domain: 'amazon.com' },
  { alias: 'amazon.com', canonicalName: 'Amazon', domain: 'amazon.com' },
  { alias: 'amazon web services', canonicalName: 'Amazon Web Services', domain: 'aws.amazon.com' },
  { alias: 'aws', canonicalName: 'Amazon Web Services', domain: 'aws.amazon.com' },
  { alias: 'microsoft', canonicalName: 'Microsoft', domain: 'microsoft.com' },
  { alias: 'msft', canonicalName: 'Microsoft', domain: 'microsoft.com' },
  { alias: 'apple', canonicalName: 'Apple', domain: 'apple.com' },
  { alias: 'apple inc', canonicalName: 'Apple', domain: 'apple.com' },
  { alias: 'netflix', canonicalName: 'Netflix', domain: 'netflix.com' },
  { alias: 'nflx', canonicalName: 'Netflix', domain: 'netflix.com' },
  { alias: 'uber', canonicalName: 'Uber', domain: 'uber.com' },
  { alias: 'uber technologies', canonicalName: 'Uber', domain: 'uber.com' },
  { alias: 'lyft', canonicalName: 'Lyft', domain: 'lyft.com' },
  { alias: 'airbnb', canonicalName: 'Airbnb', domain: 'airbnb.com' },
  { alias: 'air bnb', canonicalName: 'Airbnb', domain: 'airbnb.com' },
  { alias: 'spotify', canonicalName: 'Spotify', domain: 'spotify.com' },
  { alias: 'twitter', canonicalName: 'X (Twitter)', domain: 'x.com' },
  { alias: 'x corp', canonicalName: 'X (Twitter)', domain: 'x.com' },
  { alias: 'x.com', canonicalName: 'X (Twitter)', domain: 'x.com' },
  { alias: 'salesforce', canonicalName: 'Salesforce', domain: 'salesforce.com' },
  { alias: 'salesforce.com', canonicalName: 'Salesforce', domain: 'salesforce.com' },
  { alias: 'adobe', canonicalName: 'Adobe', domain: 'adobe.com' },
  { alias: 'adobe inc', canonicalName: 'Adobe', domain: 'adobe.com' },
  { alias: 'oracle', canonicalName: 'Oracle', domain: 'oracle.com' },
  { alias: 'oracle corporation', canonicalName: 'Oracle', domain: 'oracle.com' },
  { alias: 'ibm', canonicalName: 'IBM', domain: 'ibm.com' },
  { alias: 'international business machines', canonicalName: 'IBM', domain: 'ibm.com' },
  { alias: 'intel', canonicalName: 'Intel', domain: 'intel.com' },
  { alias: 'intel corporation', canonicalName: 'Intel', domain: 'intel.com' },
  { alias: 'cisco', canonicalName: 'Cisco', domain: 'cisco.com' },
  { alias: 'cisco systems', canonicalName: 'Cisco', domain: 'cisco.com' },
  { alias: 'vmware', canonicalName: 'VMware', domain: 'vmware.com' },
  { alias: 'palantir', canonicalName: 'Palantir', domain: 'palantir.com' },
  { alias: 'palantir technologies', canonicalName: 'Palantir', domain: 'palantir.com' },
  { alias: 'stripe', canonicalName: 'Stripe', domain: 'stripe.com' },
  { alias: 'stripe inc', canonicalName: 'Stripe', domain: 'stripe.com' },
  { alias: 'shopify', canonicalName: 'Shopify', domain: 'shopify.com' },
  { alias: 'shopify inc', canonicalName: 'Shopify', domain: 'shopify.com' },
  { alias: 'block', canonicalName: 'Block (Square)', domain: 'block.xyz' },
  { alias: 'square', canonicalName: 'Block (Square)', domain: 'block.xyz' },
  { alias: 'block inc', canonicalName: 'Block (Square)', domain: 'block.xyz' },
  { alias: 'snowflake', canonicalName: 'Snowflake', domain: 'snowflake.com' },
  { alias: 'databricks', canonicalName: 'Databricks', domain: 'databricks.com' },
  { alias: 'datadog', canonicalName: 'Datadog', domain: 'datadoghq.com' },
  { alias: 'cloudflare', canonicalName: 'Cloudflare', domain: 'cloudflare.com' },
  { alias: 'twilio', canonicalName: 'Twilio', domain: 'twilio.com' },
  { alias: 'twilio inc', canonicalName: 'Twilio', domain: 'twilio.com' },
  { alias: 'github', canonicalName: 'GitHub', domain: 'github.com' },
  { alias: 'gitlab', canonicalName: 'GitLab', domain: 'gitlab.com' },
  { alias: 'atlassian', canonicalName: 'Atlassian', domain: 'atlassian.com' },
  { alias: 'slack', canonicalName: 'Salesforce (Slack)', domain: 'salesforce.com' },
  { alias: 'slack technologies', canonicalName: 'Salesforce (Slack)', domain: 'salesforce.com' },
  { alias: 'figma', canonicalName: 'Figma', domain: 'figma.com' },
  { alias: 'canva', canonicalName: 'Canva', domain: 'canva.com' },
  { alias: 'notion', canonicalName: 'Notion', domain: 'notion.so' },
  { alias: 'notion labs', canonicalName: 'Notion', domain: 'notion.so' },
  { alias: 'discord', canonicalName: 'Discord', domain: 'discord.com' },
  { alias: 'discord inc', canonicalName: 'Discord', domain: 'discord.com' },
  { alias: 'tiktok', canonicalName: 'TikTok', domain: 'tiktok.com' },
  { alias: 'bytedance', canonicalName: 'ByteDance', domain: 'bytedance.com' },
  { alias: 'bytedance ltd', canonicalName: 'ByteDance', domain: 'bytedance.com' },
  { alias: 'snap', canonicalName: 'Snap', domain: 'snap.com' },
  { alias: 'snapchat', canonicalName: 'Snap', domain: 'snap.com' },
  { alias: 'snap inc', canonicalName: 'Snap', domain: 'snap.com' },
  { alias: 'pinterest', canonicalName: 'Pinterest', domain: 'pinterest.com' },
  { alias: 'linkedin', canonicalName: 'Microsoft (LinkedIn)', domain: 'linkedin.com' },
  { alias: 'linkedin corporation', canonicalName: 'Microsoft (LinkedIn)', domain: 'linkedin.com' },
  { alias: 'dropbox', canonicalName: 'Dropbox', domain: 'dropbox.com' },
  { alias: 'dropbox inc', canonicalName: 'Dropbox', domain: 'dropbox.com' },
  { alias: 'zoom', canonicalName: 'Zoom', domain: 'zoom.us' },
  { alias: 'zoom video communications', canonicalName: 'Zoom', domain: 'zoom.us' },
  { alias: 'robinhood', canonicalName: 'Robinhood', domain: 'robinhood.com' },
  { alias: 'robinhood markets', canonicalName: 'Robinhood', domain: 'robinhood.com' },
  { alias: 'coinbase', canonicalName: 'Coinbase', domain: 'coinbase.com' },
  { alias: 'coinbase global', canonicalName: 'Coinbase', domain: 'coinbase.com' },
  { alias: 'paypal', canonicalName: 'PayPal', domain: 'paypal.com' },
  { alias: 'paypal holdings', canonicalName: 'PayPal', domain: 'paypal.com' },
  { alias: 'visa', canonicalName: 'Visa', domain: 'visa.com' },
  { alias: 'visa inc', canonicalName: 'Visa', domain: 'visa.com' },
  { alias: 'mastercard', canonicalName: 'Mastercard', domain: 'mastercard.com' },
  { alias: 'goldman sachs', canonicalName: 'Goldman Sachs', domain: 'goldmansachs.com' },
  { alias: 'jpmorgan', canonicalName: 'JPMorgan Chase', domain: 'jpmorgan.com' },
  { alias: 'jpmorgan chase', canonicalName: 'JPMorgan Chase', domain: 'jpmorgan.com' },
  { alias: 'jp morgan', canonicalName: 'JPMorgan Chase', domain: 'jpmorgan.com' },
  { alias: 'morgan stanley', canonicalName: 'Morgan Stanley', domain: 'morganstanley.com' },
  { alias: 'capital one', canonicalName: 'Capital One', domain: 'capitalone.com' },
  { alias: 'capital one financial', canonicalName: 'Capital One', domain: 'capitalone.com' },
  { alias: 'visa inc.', canonicalName: 'Visa', domain: 'visa.com' },
];

export class CompanyNormalizer {
  private static aliases: CompanyAlias[] = KNOWN_COMPANY_ALIASES;

  static normalize(name: string, domain?: string | null): CompanyNormalizationResult {
    const normalizedName = this.normalizeName(name);
    const normalizedDomain = domain ? this.normalizeDomain(domain) : null;

    const knownAlias = this.findKnownAlias(normalizedName);
    if (knownAlias) {
      return {
        normalizedName: knownAlias.canonicalName,
        normalizedDomain: knownAlias.domain || normalizedDomain,
        aliases: this.getAliasesForCanonical(knownAlias.canonicalName),
        isKnownCompany: true,
        mergedCompanyId: null,
      };
    }

    return {
      normalizedName,
      normalizedDomain,
      aliases: [normalizedName],
      isKnownCompany: false,
      mergedCompanyId: null,
    };
  }

  static shouldMerge(
    name1: string,
    domain1: string | null,
    name2: string,
    domain2: string | null,
  ): boolean {
    if (domain1 && domain2) {
      const d1 = this.normalizeDomain(domain1);
      const d2 = this.normalizeDomain(domain2);
      if (d1 === d2 && d1.length > 3) return true;
    }

    const n1 = this.normalizeName(name1);
    const n2 = this.normalizeName(name2);
    if (n1 === n2) return true;

    const similarity = this.calculateSimilarity(n1, n2);
    if (similarity > 0.85) return true;

    if (domain1 && n2.toLowerCase().includes(this.extractNameFromDomain(domain1))) return true;
    if (domain2 && n1.toLowerCase().includes(this.extractNameFromDomain(domain2))) return true;

    return false;
  }

  static findDuplicates(
    companies: Array<{ id: string; name: string; domain: string | null }>,
  ): Array<{ keep: string; merge: string; reason: string }[]> {
    const duplicates: Array<{ keep: string; merge: string; reason: string }> = [];
    const processed = new Set<string>();

    for (let i = 0; i < companies.length; i++) {
      for (let j = i + 1; j < companies.length; j++) {
        const a = companies[i];
        const b = companies[j];
        const key = [a.id, b.id].sort().join('-');
        if (processed.has(key)) continue;

        if (this.shouldMerge(a.name, a.domain, b.name, b.domain)) {
          const keep = a.name.length <= b.name.length ? a : b;
          const merge = keep === a ? b : a;
          duplicates.push({
            keep: keep.id,
            merge: merge.id,
            reason: `Domain match: ${a.domain} = ${b.domain}`,
          });
          processed.add(key);
        }
      }
    }

    return duplicates;
  }

  private static normalizeName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[,\.]$/g, '')
      .replace(/^(the|a|an)\s+/i, '');
  }

  private static normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .replace(/^(https?:\/\/|www\.|mail\.|app\.)/, '')
      .replace(/\/.*$/, '')
      .replace(/\.com$|\.io$|\.co$|\.org$|\.net$/, '');
  }

  private static findKnownAlias(name: string): CompanyAlias | undefined {
    const lower = name.toLowerCase();
    return this.aliases.find((a) => a.alias.toLowerCase() === lower);
  }

  private static getAliasesForCanonical(canonicalName: string): string[] {
    return this.aliases
      .filter((a) => a.canonicalName === canonicalName)
      .map((a) => a.alias);
  }

  private static extractNameFromDomain(domain: string): string {
    const normalized = this.normalizeDomain(domain);
    const parts = normalized.split('.');
    return parts.length > 0 ? parts[0] : normalized;
  }

  private static calculateSimilarity(a: string, b: string): number {
    const words1 = new Set(a.toLowerCase().split(/\s+/));
    const words2 = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}
