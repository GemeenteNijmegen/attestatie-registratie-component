# Attestation Rulebook for attestations of type Permits — Street Trading (Standplaatsvergunning)

| Version | Date       | Description                                                                |
| ------- | ---------- | -------------------------------------------------------------------------- |
| 1.0     | 24-06-2025 | First version                                                              |
| 1.1     | 11-05-2026 | Aligned with Permits base Rulebook v1.4 (PuB-EAA-only, SD-JWT VC-only).    |

This Rulebook is an **extension** of the base Permits Attestation Rulebook defined in [base.md](./base.md). All chapters, sections, requirements, attributes, metadata, encoding rules, trust-anchor mechanisms, revocation mechanisms, compliance statements and references defined in [base.md](./base.md) apply unchanged unless explicitly overridden or extended below. Only the additions specific to street-trading permits (NL: *standplaatsvergunning*) are defined here.

* Author(s):
    * Marnix Dessing (Gemeente Nijmegen)
    * Sten Reijers (Ver.iD)

**Feedback:**

* [https://github.com/GemeenteNijmegen/attestatie-registratie-component](https://github.com/GemeenteNijmegen/attestatie-registratie-component/)

## 1 Introduction

### 1.1 Document scope and purpose

This Rulebook specializes [base.md](./base.md) for **street-trading permits** (*standplaatsvergunning*) issued by Dutch municipalities. A street-trading permit authorizes the holder to operate a market stall or comparable commercial activity at a specific public location and is therefore inherently location-bound; the location is conveyed by the mandatory `locatie` and `type_locatie` attributes added in Section 2.2.

Sections [1.2](./base.md#12-document-structure), [1.3](./base.md#13-key-words) and [1.4](./base.md#14-terminology) of [base.md](./base.md) apply unchanged.

## 2 Attestation attributes and metadata

The chapter overview and Annex VII / [Topic 12] requirements stated in [base.md §2](./base.md#2-attestation-attributes-and-metadata) apply unchanged: a street-trading permit attestation is a PuB-EAA.

### 2.1 Introduction

[base.md §2.1](./base.md#21-introduction) applies unchanged. Within the base classification, a street-trading permit is identified by:

* `upl_naam` = `"Standplaatsvergunning"` — the cross-authority UPL anchor;
* `product_naam` and `product_type_code` — local to the granting municipality;
* `vct` = `urn:eudi:nl:vng:permit:streettrading:1` (see Section 3.2).

### 2.2 Mandatory attributes

In addition to the mandatory attributes defined in [base.md §2.2](./base.md#22-mandatory-attributes), the following attributes SHALL be included, because street-trading permits are always tied to a specific physical location:

| **Data Identifier** | **Definition**                                                                                         | **Data type** | **Example value**    |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ------------- | -------------------- |
| locatie             | Address or designation of the physical location to which the permit applies.                           | string        | Plein 1944, Nijmegen |
| type_locatie        | Classification of the location (e.g., `vaste standplaats`, `mobiele standplaats`, `binnen`, `buiten`). | string        | Vaste standplaats    |

### 2.3 Optional attributes

Not specified beyond [base.md §2.3](./base.md#23-optional-attributes).

### 2.4 Conditional attributes

Not specified beyond [base.md §2.4](./base.md#24-conditional-attributes).

### 2.5 Mandatory metadata

The mandatory metadata defined in [base.md §2.5](./base.md#25-mandatory-metadata) (`issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) apply unchanged. For street-trading permits:

* `attestation_legal_category` SHALL be `"PuB-EAA"`.
* `cryptographically_bound_to` SHALL be `"urn:eudi:pid:1"`.

No additional metadata is defined by this Rulebook.

### 2.6 Optional metadata

Not specified beyond [base.md §2.6](./base.md#26-optional-metadata).

### 2.7 Conditional metadata

Not specified beyond [base.md §2.7](./base.md#27-conditional-metadata).

## 3 Attestation encoding

### 3.1 ISO/IEC 18013-5-compliant encoding

Not applicable; mdoc encoding SHALL NOT be used (see [base.md §3.1](./base.md#31-isoiec-18013-5-compliant-encoding)).

### 3.2 SD-JWT VC-based encoding

The encoding rules of [base.md §3.2](./base.md#32-sd-jwt-vc-based-encoding) apply unchanged. The following value is specific to this Rulebook:

* `vct` SHALL be `urn:eudi:nl:vng:permit:streettrading:1`, formed by extending the base URN `urn:eudi:nl:vng:permit:1` with the type segment `streettrading` before the version, as prescribed by [base.md §3.2](./base.md#32-sd-jwt-vc-based-encoding).

The street-trading-specific claims are encoded as follows:

| **Data Identifier** | **Attribute identifier** | **Encoding format** | **Notes**         | **Disclosable** |
| ------------------- | ------------------------ | ------------------- | ----------------- | --------------- |
| locatie             | locatie                  | string              | Defined in §2.2.  | MUST            |
| type_locatie        | type_locatie             | string              | Defined in §2.2.  | MUST            |

The encoding and disclosability of all inherited claims (`upl_naam`, `product_naam`, `product_type_code`, `kenmerk`, `geldig_van`, `geldig_tot`, `issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) are governed by [base.md §3.2](./base.md#32-sd-jwt-vc-based-encoding).

### 3.3 W3C Verifiable Credentials Data Model-based encoding

Not applicable; W3C VCDM encoding SHALL NOT be used (see [base.md §3.3](./base.md#33-w3c-verifiable-credentials-data-model-based-encoding)).

## 4 Attestation usage

The attestation usage requirements of [base.md §4](./base.md#4-attestation-usage) apply unchanged. Street-trading permit attestations are therefore device-bound, cryptographically bound at issuance to the User's PID (`vct = urn:eudi:pid:1`) on the same Wallet Unit, and presented exclusively online using the [HAIP] profile of OpenID4VP.

Typical Relying Parties for this attestation type are municipal enforcement officers (BOAs) verifying a stall holder's authorisation on site through an online verifier application, and market masters verifying assignment of pitches. Whenever the Relying Party needs to identify the natural person holding the permit, it SHALL also request the bound PID and a proof of cryptographic binding, as specified in [base.md §4](./base.md#4-attestation-usage).

## 5 Trust anchors

See [base.md §5](./base.md#5-trust-anchors).

## 6 Revocation

See [base.md §6](./base.md#6-revocation).

## 7 Compliance

See [base.md §7](./base.md#7-compliance).

## 8 References

See [base.md §8](./base.md#8-references).
