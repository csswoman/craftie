export type DocsSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  code?: string;
};

export type DocsPage = {
  slug: string;
  section: string;
  title: string;
  description: string;
  lead: string;
  generated: string[];
  usage: string[];
  limitations: string[];
  sections: DocsSection[];
  kind?: 'home' | 'semantic-roles' | 'export' | 'standard';
};

export type DocsGroup = {
  title: string;
  pages: DocsPage[];
};

export const page = (
  slug: string,
  section: string,
  title: string,
  description: string,
  lead: string,
  generated: string[],
  usage: string[],
  limitations: string[],
  sections: DocsSection[],
  kind: DocsPage['kind'] = 'standard',
): DocsPage => ({
  slug,
  section,
  title,
  description,
  lead,
  generated,
  usage,
  limitations,
  sections,
  kind,
});
