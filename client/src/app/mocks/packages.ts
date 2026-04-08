import type { PurlSummary } from "@app/client";

export const mockPackages: PurlSummary[] = [
  {
    uuid: "pkg-001",
    purl: "pkg:rpm/redhat/openssl@3.0.7-27.el9?arch=x86_64",
    base: {
      uuid: "base-001",
      purl: "pkg:rpm/redhat/openssl",
    },
    qualifiers: { arch: "x86_64" },
    version: {
      uuid: "ver-001",
      purl: "pkg:rpm/redhat/openssl@3.0.7-27.el9",
      version: "3.0.7-27.el9",
    },
  },
  {
    uuid: "pkg-002",
    purl: "pkg:rpm/redhat/kernel@5.14.0-362.el9?arch=x86_64",
    base: {
      uuid: "base-002",
      purl: "pkg:rpm/redhat/kernel",
    },
    qualifiers: { arch: "x86_64" },
    version: {
      uuid: "ver-002",
      purl: "pkg:rpm/redhat/kernel@5.14.0-362.el9",
      version: "5.14.0-362.el9",
    },
  },
  {
    uuid: "pkg-003",
    purl: "pkg:npm/@angular/core@17.3.0",
    base: {
      uuid: "base-003",
      purl: "pkg:npm/@angular/core",
    },
    qualifiers: {},
    version: {
      uuid: "ver-003",
      purl: "pkg:npm/@angular/core@17.3.0",
      version: "17.3.0",
    },
  },
  {
    uuid: "pkg-004",
    purl: "pkg:maven/org.apache.logging.log4j/log4j-core@2.23.1",
    base: {
      uuid: "base-004",
      purl: "pkg:maven/org.apache.logging.log4j/log4j-core",
    },
    qualifiers: {},
    version: {
      uuid: "ver-004",
      purl: "pkg:maven/org.apache.logging.log4j/log4j-core@2.23.1",
      version: "2.23.1",
    },
  },
  {
    uuid: "pkg-005",
    purl: "pkg:rpm/redhat/sqlite-libs@3.34.1-7.el9?arch=x86_64",
    base: {
      uuid: "base-005",
      purl: "pkg:rpm/redhat/sqlite-libs",
    },
    qualifiers: { arch: "x86_64" },
    version: {
      uuid: "ver-005",
      purl: "pkg:rpm/redhat/sqlite-libs@3.34.1-7.el9",
      version: "3.34.1-7.el9",
    },
  },
  {
    uuid: "pkg-006",
    purl: "pkg:npm/react@19.0.0",
    base: {
      uuid: "base-006",
      purl: "pkg:npm/react",
    },
    qualifiers: {},
    version: {
      uuid: "ver-006",
      purl: "pkg:npm/react@19.0.0",
      version: "19.0.0",
    },
  },
  {
    uuid: "pkg-007",
    purl: "pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.17.0",
    base: {
      uuid: "base-007",
      purl: "pkg:maven/com.fasterxml.jackson.core/jackson-databind",
    },
    qualifiers: {},
    version: {
      uuid: "ver-007",
      purl: "pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.17.0",
      version: "2.17.0",
    },
  },
  {
    uuid: "pkg-008",
    purl: "pkg:rpm/redhat/httpd@2.4.57-8.el9?arch=x86_64",
    base: {
      uuid: "base-008",
      purl: "pkg:rpm/redhat/httpd",
    },
    qualifiers: { arch: "x86_64" },
    version: {
      uuid: "ver-008",
      purl: "pkg:rpm/redhat/httpd@2.4.57-8.el9",
      version: "2.4.57-8.el9",
    },
  },
  {
    uuid: "pkg-009",
    purl: "pkg:oci/ubi9@sha256:abc123?repository_url=registry.access.redhat.com/ubi9",
    base: {
      uuid: "base-009",
      purl: "pkg:oci/ubi9",
    },
    qualifiers: { repository_url: "registry.access.redhat.com/ubi9" },
    version: {
      uuid: "ver-009",
      purl: "pkg:oci/ubi9@sha256:abc123",
      version: "sha256:abc123",
    },
  },
  {
    uuid: "pkg-010",
    purl: "pkg:rpm/redhat/python3.12@3.12.4-1.el9?arch=x86_64",
    base: {
      uuid: "base-010",
      purl: "pkg:rpm/redhat/python3.12",
    },
    qualifiers: { arch: "x86_64" },
    version: {
      uuid: "ver-010",
      purl: "pkg:rpm/redhat/python3.12@3.12.4-1.el9",
      version: "3.12.4-1.el9",
    },
  },
];
