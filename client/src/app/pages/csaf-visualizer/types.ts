export interface CsafDocument {
  document: DocumentMeta;
  product_tree: ProductTree;
  vulnerabilities: Vulnerability[];
}

export interface DocumentMeta {
  aggregate_severity?: { namespace: string; text: string };
  category: string;
  csaf_version: string;
  distribution?: {
    text: string;
    tlp?: { label: string; url: string };
  };
  lang?: string;
  notes?: { category: string; text: string; title: string }[];
  publisher: {
    category: string;
    contact_details?: string;
    issuing_authority?: string;
    name: string;
    namespace: string;
  };
  references?: { category: string; summary: string; url: string }[];
  title: string;
  tracking: {
    current_release_date: string;
    generator?: { date: string; engine: { name: string; version: string } };
    id: string;
    initial_release_date: string;
    revision_history: { date: string; number: string; summary: string }[];
    status: string;
    version: string;
  };
}

export interface ProductTree {
  branches: Branch[];
  relationships?: Relationship[];
}

export interface Branch {
  category: string;
  name: string;
  branches?: Branch[];
  product?: Product;
}

export interface Product {
  name: string;
  product_id: string;
  product_identification_helper?: {
    cpe?: string;
    purl?: string;
  };
}

export interface Relationship {
  category: string;
  full_product_name: {
    name: string;
    product_id: string;
  };
  product_reference: string;
  relates_to_product_reference: string;
}

export interface Vulnerability {
  cve: string;
  cwe?: { id: string; name: string };
  discovery_date?: string;
  ids?: { system_name: string; text: string }[];
  notes?: { category: string; text: string; title: string }[];
  references?: { category: string; summary: string; url: string }[];
  release_date?: string;
  remediations?: Remediation[];
  scores?: Score[];
  threats?: { category: string; details: string; product_ids: string[] }[];
  title: string;
}

export interface Remediation {
  category: string;
  details: string;
  product_ids: string[];
  url?: string;
}

export interface Score {
  cvss_v3?: {
    attackComplexity: string;
    attackVector: string;
    availabilityImpact: string;
    baseScore: number;
    baseSeverity: string;
    confidentialityImpact: string;
    integrityImpact: string;
    privilegesRequired: string;
    scope: string;
    userInteraction: string;
    vectorString: string;
    version: string;
  };
  products: string[];
}

export function collectProducts(tree: ProductTree): Product[] {
  const products: Product[] = [];

  function walkBranches(branches: Branch[]) {
    for (const branch of branches) {
      if (branch.product) {
        products.push(branch.product);
      }
      if (branch.branches) {
        walkBranches(branch.branches);
      }
    }
  }

  walkBranches(tree.branches);
  return products;
}

export function collectRelationshipProducts(
  tree: ProductTree
): { name: string; product_id: string }[] {
  if (!tree.relationships) return [];
  return tree.relationships.map((r) => r.full_product_name);
}
