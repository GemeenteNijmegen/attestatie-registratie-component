# Attestation Rulebook for attestations of type Permits

| Field    | Value                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Status   | Draft                                                                                                                                 |
| Created  | 2026-05-11                                                                                                                            |
| Updated  | 2026-05-11                                                                                                                            |
| Authors  | Marnix Dessing (Gemeente Nijmegen), Sten Reijers (Ver.iD)                                                                             |
| Feedback | [github.com/GemeenteNijmegen/attestatie-registratie-component](https://github.com/GemeenteNijmegen/attestatie-registratie-component/) |

## Versions

| Version | Date       | Description                                                                                                                         |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-05-11 | First version of the Permits base Attestation Rulebook. Defines a generic, UPL-classified PuB-EAA permit type encoded as SD-JWT VC. |

## 1 Introduction

### 1.1 Document scope and purpose

This Rulebook defines the base attestation type for **permits** issued by Dutch public sector bodies (gemeenten, provincies, waterschappen, Rijk) to a User's Wallet Unit. A permit attestation is a PuB-EAA providing a verifiable, machine-readable representation of a granted permit, classified according to the Dutch Uniforme Productnamenlijst (UPL), and is presented by the Wallet Unit to Relying Parties. Specific permit types (e.g. standplaatsvergunning, evenementenvergunning) extend this base type.

### 1.2 Document structure

- [Attestation Rulebook for attestations of type Permits](#attestation-rulebook-for-attestations-of-type-permits)
  - [Versions](#versions)
  - [1 Introduction](#1-introduction)
    - [1.1 Document scope and purpose](#11-document-scope-and-purpose)
    - [1.2 Document structure](#12-document-structure)
    - [1.3 Key words](#13-key-words)
    - [1.4 Terminology](#14-terminology)
  - [2 Extension model](#2-extension-model)
  - [3 Attestation attributes and metadata](#3-attestation-attributes-and-metadata)
    - [Chapter overview and requirements](#chapter-overview-and-requirements)
    - [3.1 Introduction](#31-introduction)
    - [3.2 Mandatory attributes](#32-mandatory-attributes)
    - [3.3 Optional attributes](#33-optional-attributes)
    - [3.4 Conditional attributes](#34-conditional-attributes)
    - [3.5 Mandatory metadata](#35-mandatory-metadata)
    - [3.6 Optional metadata](#36-optional-metadata)
    - [3.7 Conditional metadata](#37-conditional-metadata)
  - [4 Attestation encoding](#4-attestation-encoding)
    - [4.1 ISO/IEC 18013-5-compliant encoding](#41-isoiec-18013-5-compliant-encoding)
    - [4.2 SD-JWT VC-based encoding](#42-sd-jwt-vc-based-encoding)
      - [Verifiable Credential Type (`vct`)](#verifiable-credential-type-vct)
      - [Type Metadata Document](#type-metadata-document)
      - [Key binding (`cnf`)](#key-binding-cnf)
      - [Claim naming policy](#claim-naming-policy)
      - [Private claims defined by this Rulebook](#private-claims-defined-by-this-rulebook)
      - [Envelope claims populated by Attestation Providers](#envelope-claims-populated-by-attestation-providers)
      - [Examples](#examples)
    - [4.3 W3C Verifiable Credentials Data Model-based encoding](#43-w3c-verifiable-credentials-data-model-based-encoding)
  - [5 Attestation usage](#5-attestation-usage)
  - [6 Trust anchors](#6-trust-anchors)
  - [7 Revocation](#7-revocation)
  - [8 Compliance](#8-compliance)
    - [8.1 Annex VII of the European Digital Identity Regulation](#81-annex-vii-of-the-european-digital-identity-regulation)
    - [8.2 Topic 12 of the ARF — Attestation Rulebook requirements](#82-topic-12-of-the-arf--attestation-rulebook-requirements)
  - [9 References](#9-references)

### 1.3 Key words

This document uses the capitalised key words 'SHALL', 'SHOULD' and 'MAY' as
specified in [RFC 2119], i.e., to indicate requirements, recommendations and
options specified in this document.

In addition, 'must' (non-capitalised) is used to indicate an external
constraint, i.e., a requirement that is not mandated by this document, but, for
instance, by an external document. The word 'can' indicates a capability,
whereas other words, such as 'will', and 'is' or 'are' are intended as
statements of fact.

### 1.4 Terminology

This document uses the terminology specified in Annex 1 of the ARF.

## 2 Extension model

This Rulebook (the **base**) is extended by **sub-type Rulebooks**, one per permit category — for example *standplaatsvergunning*, *evenementenvergunning*, *parkeervergunning*. There is no intermediate layer.

A sub-type Rulebook:

- SHALL inherit every requirement of this base unchanged;
- SHALL declare its **subject category** — either *natural person* or *legal entity* — and, by doing so, inherits the binding defaults set out below for that subject;
- MAY add type-specific attributes following the claim-naming policy in [Section 4.2](#42-sd-jwt-vc-based-encoding);
- MAY tighten an inherited requirement (e.g. raise OPTIONAL to MANDATORY) but SHALL NOT loosen one;
- SHALL NOT change claim semantics, the base `vct` URN structure, or the fixed value `"PuB-EAA"` of `attestation_legal_category`;
- MAY override the binding defaults below, within the rules set out in *Sub-type overrides* below.

The sub-type's `vct` URN extends the base by appending a type segment before the version, for example `urn:eudi:nl:vng:permit:streettrading:v1`.

### Binding defaults per subject

A permit attestation has exactly one subject — the entity to which the permit was granted. The base defines three subject categories and the default binding for each. These defaults apply unless a sub-type Rulebook explicitly overrides them per the rules below.

| Subject category                   | Default `cryptographically_bound_to`                                                              | Default `cnf` (device binding) | Typical permits                                                                                                       |
|------------------------------------|---------------------------------------------------------------------------------------------------|--------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| Natural person                     | the User's PID, of the form `urn:eudi:pid:<cc>:1` (e.g. `urn:eudi:pid:nl:1`)                      | MUST be present                | parkeervergunning, standplaatsvergunning, particuliere evenementenvergunning, hondenuitlaatvergunning, …              |
| Legal entity                       | a KvK registration attestation (or the EUDI LPID attestation, once its Rulebook is published)     | MUST be present                | horecavergunning, drank- en horecavergunning, exploitatievergunning, omgevingsvergunning voor bouw door aannemer, …   |
| Indirect — see note below          | *not set by default*                                                                              | *open — see note below*        | *under deliberation — to be populated once the policy below is refined*                                               |

**Note on the *Indirect* category (under deliberation by the Scheme Provider).** This category covers permits where the underlying subject is still a natural or legal person — the applicant to whom the permit was granted — but where the *issuance* process is intentionally decoupled from a cryptographic binding to the applicant, and the *presenter* at verification time may not be the applicant. Examples that motivate this category include permits whose enforcement and verification take place against an operational identifier (a kenmerk, a license plate, a parcel reference) looked up in a registry, rather than against the applicant's identity credential; and permits where a delegate presents on behalf of the entity to whom the permit was granted. The Scheme Provider is still deliberating on (i) the appropriate default for `cryptographically_bound_to` for this category — whether to leave it unset, to bind to an operational anchor (e.g. RDW vehicle attestation, future Kadaster attestation), or to define a new claim conveying the operational identifier; (ii) the appropriate default for `cnf` / device binding; (iii) how the requirement to unambiguously represent the entity to which the permit's attributes refer is satisfied when binding is decoupled from the applicant; and (iv) how the applicant–presenter distinction is captured in the attestation, if at all. Sub-type Rulebooks that fit this pattern SHOULD wait for the Scheme Provider to publish a refined policy before pinning their own choices. This Rulebook will be updated when that deliberation concludes.

### Sub-type overrides

A sub-type Rulebook MAY deviate from the defaults above in one of two ways:

1. **Override the anchor credential.** A sub-type MAY set `cryptographically_bound_to` to a credential other than the subject's identity credential, when the operational anchor for the permit is a different entity than the entity to which the permit was granted. The canonical example is a permit issued to a natural person but tied to a specific vehicle by license plate (e.g. milieuzone-ontheffing op kenteken, parkeerontheffing op kenteken), where the binding is to an RDW vehicle-keeper attestation rather than to the User's PID. The sub-type SHALL document how the chosen anchor identifies the entity to which the permit's attributes refer. Device binding (`cnf`) is retained.

2. **Waive binding entirely (transferable / bearer permits).** A sub-type MAY waive both device binding and cross-credential binding, by omitting both `cnf` and `cryptographically_bound_to` from issued attestations. This is the only way a permit can be presented from a Wallet Unit other than the one that received it (bezoekersparkeerkaart, evenementenpas voor een groep, day-passes). The two waivers SHALL be taken together — they cannot be applied independently, because cross-credential binding builds on device binding via a shared-WSCA/WSCD proof. A sub-type selecting this option SHALL document that the holder at presentation is not necessarily the entity to whom the permit was granted, SHALL still bind refresh tokens for re-issuance to a WSCA/WSCD on the same Wallet Unit (as required by the ARF for non-device-bound issuance, currently in draft), and SHALL document the residual risk that the SD-JWT VC can be copied between devices.

A sub-type MAY combine these overrides only in trivial ways: overriding the anchor while retaining device binding (case 1), or waiving both (case 2). A sub-type SHALL NOT retain `cryptographically_bound_to` while omitting `cnf`, nor the reverse.

**Single-anchor scope.** The `cryptographically_bound_to` field carries a single concrete `vct` per issued attestation. Multi-anchor permits (e.g. simultaneously bound to a PID and a vehicle attestation) are out of scope for this version of the Rulebook.

## 3 Attestation attributes and metadata

### Chapter overview and requirements

This chapter defines, in an encoding-independent manner, all attributes and metadata that a permit attestation conforming to this Rulebook may contain. Each field is classified as mandatory, optional, or conditional in the corresponding subsection. Where applicable, identifiers reuse established Dutch public-sector vocabularies — notably the Uniforme Productnamenlijst — rather than introducing new terms.

Permit attestations defined by this Rulebook are PuB-EAAs. The compliance matrix in [Chapter 8](#8-compliance) records how each substantive requirement of Annex VII of the [European Digital Identity Regulation] and of the ARF is met by a specific field or section of this Rulebook.

### 3.1 Introduction

This Rulebook defines the base permit attestation type shared by every permit attestation issued under this scheme. Specific permit categories (e.g. street-trading, event, parking) are defined in sub-type Rulebooks that extend this base.

Within the base, the kind of permit is conveyed by claim *values*, not by the attribute set:

- `upl_naam` is the sole cross-authority semantic anchor, carrying the standardised name from the Dutch Uniforme Productnamenlijst (UPL).
- `product_naam` and `product_type_code` are local to the granting authority (typically a municipality) and SHALL NOT be relied upon for cross-authority semantics.

Sub-type Rulebooks MAY add type-specific attributes and metadata, but SHALL inherit, and SHALL NOT redefine or remove, any mandatory attribute or metadata field defined here.

Every permit attestation defined by this Rulebook carries the `attestation_legal_category` metadata field, fixed to the value `"PuB-EAA"`, in a form suitable for automated processing.

The entity to which the attested attributes refer is not represented by duplicate subject attributes inside the permit. Instead, by default, the permit attestation SHALL be cryptographically bound during issuance to the User's PID (`vct` of the form `urn:eudi:pid:<cc>:1`, e.g. `urn:eudi:pid:nl:1`) on the same Wallet Unit, via issuance-time identity verification combined with a shared-WSCA/WSCD proof. The identity of the entity to whom the permit was granted is therefore conveyed by the bound anchor credential at presentation time. This approach complies with the data-minimisation principle: a Relying Party only learns the anchor credential's attributes when those are explicitly requested.

A sub-type Rulebook extending this base MAY override the anchor credential type — for example to a Chamber of Commerce registration attestation for business-related permits, or to an RDW vehicle-keeper attestation for vehicle-related permits — or MAY waive cross-credential binding entirely. The override mechanism is specified in [Section 4.2](#42-sd-jwt-vc-based-encoding) (for the underlying device-binding requirement) and [Chapter 5](#5-attestation-usage) (for the cross-credential binding requirement). The metadata field `cryptographically_bound_to`, specified in [Section 3.5](#35-mandatory-metadata) below, advertises the selected binding to Relying Parties.

The scheme of attestations is conveyed by the `vct` claim defined in [Section 4.2](#42-sd-jwt-vc-based-encoding). The base `vct` for permits defined by this Rulebook is the URN `urn:eudi:nl:vng:permit:1`. Sub-type Rulebooks (e.g. for a specific permit type such as street trading) extend this base by appending a type segment before the version, for example `urn:eudi:nl:vng:permit:streettrading:1`.

Sections 3.2 - 3.7 list each attribute and metadata field with its data identifier, semantic definition, data type, and an example value. Identifiers are lowercase snake_case and machine-readable.

### 3.2 Mandatory attributes

| **Data Identifier** | **Definition**                                                                            | **Data type** | **Example value**                    |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------- | ------------------------------------ |
| upl_naam            | Standardized product name as defined in the Dutch Uniforme Productnamenlijst (UPL).       | string        | Standplaatsvergunning                |
| product_naam        | Human-readable name of the specific permit as issued by the granting authority.           | string        | Demo Standplaatsvergunning           |
| product_type_code   | Code identifying the product/permit type.                                                 | string        | test-vierdaagse                      |
| kenmerk             | Unique reference number assigned by the granting authority to identify the issued permit. | string        | 7f1aa4b5-3193-49d6-ba76-063e797f1e3f |
| geldig_van          | Start date of validity for this permit.                                                   | full-date     | 2026-01-01                           |
| geldig_tot          | End date of validity for this permit.                                                     | full-date     | 2027-01-01                           |

*Open question for the Scheme Provider: this Rulebook does not currently impose a maximum validity duration on a permit (no upper bound on `geldig_tot − geldig_van`). A future version may introduce a base-level cap or category-specific caps — for example ≤ 24h for bearer permits, ≤ 1 year for vehicle-related permits, ≤ 5 years for permits issued under firearms or hazardous-materials legislation — to prevent abuse of overly long-lived permits.*

### 3.3 Optional attributes

Not specified.

### 3.4 Conditional attributes

Not specified.

### 3.5 Mandatory metadata

| **Data Identifier**        | **Definition**                                                                                                                                                                                                                                                                                                             | **Data type** | **Example value** |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------- |
| issuing_authority          | Name of the administrative authority that issued the permit.                                                                                                                                                                                                                                                               | string        | Gemeente Nijmegen |
| issuing_country            | Alpha-2 country code (ISO 3166-1) of the country of the issuing authority.                                                                                                                                                                                                                                                 | string        | NL                |
| attestation_legal_category | Legal category under which the attestation is issued. For permits this value is always `"PuB-EAA"`.                                                                                                                                                                                                                        | string        | PuB-EAA           |
| cryptographically_bound_to | Identifier (`vct`) of the anchor credential bound to this attestation via the shared WSCA/WSCD. Default: the User's PID, of the form `urn:eudi:pid:<cc>:1`. See note below and Chapter 5.                                                                                                                                  | string (vct)  | urn:eudi:pid:nl:1 |

Note on `cryptographically_bound_to`. The default anchor for permit attestations defined by this base Rulebook is the User's PID, whose `vct` is of the form `urn:eudi:pid:<cc>:1` (e.g. `urn:eudi:pid:nl:1`). A sub-type Rulebook extending this base MAY specify a different anchor credential type whose `vct` reflects the entity to which the permit's attributes refer — for example a Chamber of Commerce registration attestation for business-related permits, or an RDW vehicle-keeper attestation for vehicle-related permits. A sub-type Rulebook MAY also waive cross-credential binding entirely (consistent with waiving device binding per Section 4.2), in which case the `cryptographically_bound_to` field SHALL be omitted from issued attestations. A sub-type Rulebook silent on this point inherits the default. The selected anchor credential SHALL itself be a device-bound PID or attestation issued to the same Wallet Unit, so that the WSCA/WSCD-shared-key proof can be obtained.

### 3.6 Optional metadata

Not specified.

### 3.7 Conditional metadata

Not specified.

## 4 Attestation encoding

### 4.1 ISO/IEC 18013-5-compliant encoding

Attestations of this type SHALL NOT be issued in the [ISO/IEC 18013-5] mdoc format. Proximity and offline presentation are not required for permits, so the mdoc format brings no benefit; see Section 4.2 for the exclusive encoding.

### 4.2 SD-JWT VC-based encoding

Attestations of this type SHALL be encoded as SD-JWT VC, complying with the 'SD-JWT VCs' profile specified in [HAIP].

#### Verifiable Credential Type (`vct`)

The Verifiable Credential Type for permits defined by this Rulebook is the URN:

```text
urn:eudi:nl:vng:permit:v1
```

This URN is unique within the EUDI Wallet ecosystem and identifies the attestation type/scheme defined by Vereniging van Nederlandse Gemeenten (VNG) as Scheme Provider; it does not identify the Attestation Provider that issued any particular credential of this type. Every Attestation Provider issuing permits of this type SHALL include this exact URN in the `vct` claim, regardless of the Provider's internal catalog or hosting infrastructure.

Attestation Rulebooks for specific permit types SHALL extend this base by appending a type segment before the version, e.g.:

```text
urn:eudi:nl:vng:permit:streettrading:v1
urn:eudi:nl:vng:permit:evenementen:v1
urn:eudi:nl:vng:permit:standplaats:v1
```

Sub-type Rulebooks SHALL inherit all mandatory attributes and metadata from this base Rulebook and MAY define additional type-specific attributes, using the `extends` mechanism specified in Chapter 6 of [SD-JWT VC]. Sub-type Rulebooks MAY evolve their version segment independently of the base version.

The major version `:v1` covers all backwards-compatible refinements to the schema. The version SHALL be incremented for any change that breaks this contract — that is, any change that could cause a previously-conforming credential to be rejected by an updated Verifier, or cause a conforming Verifier or Wallet to misinterpret a credential, lose a cryptographic guarantee, or fail to process it.

#### Type Metadata Document

Defining a Type Metadata Document as described in Chapter 6 of [SD-JWT VC] is OPTIONAL for this Rulebook. Because the `vct` defined in this Rulebook is a URN, it is not dereferenceable and no metadata-discovery endpoint is provided; the authoritative scheme definition is this Rulebook. Attestation Providers MAY include a `vct#integrity` claim in issued credentials, computed as a Subresource Integrity hash over a Type Metadata Document consistent with this Rulebook. The mechanism by which a Verifier obtains that document is out of scope for this Rulebook.

#### Key binding (`cnf`)

By default, permit attestations defined by this base Rulebook or any sub-type Rulebook extending it SHALL be device-bound. The SD-JWT VC SHALL contain a `cnf` claim as specified in [SD-JWT VC], carrying the public key of a key pair generated by the Wallet Unit's WSCA/WSCD specifically for this attestation.

Device binding, on its own, only guarantees that the attestation cannot be transferred to another device: it binds the attestation to a private key held in the Wallet Unit's WSCA/WSCD, and to nothing else. It does not, by itself, tie the attestation to any other credential in the Wallet Unit or to any natural or legal person. Cross-credential cryptographic binding (for example, to the User's PID, a Chamber of Commerce registration, or another anchor credential) is a separate concern, specified in [Chapter 5](#5-attestation-usage), and is built on top of device binding via a shared-WSCA/WSCD proof.

A sub-type Rulebook extending this base MAY waive the device-binding requirement. A sub-type Rulebook that waives device-binding SHALL state so explicitly, SHALL omit the `cnf` claim from issued credentials, and SHALL also waive the cross-credential cryptographic binding specified in Chapter 5 — because that mechanism is built on top of device binding — and SHALL omit the `cryptographically_bound_to` metadata field (see [Section 3.5](#35-mandatory-metadata)). A sub-type Rulebook that retains device-binding MAY independently waive cross-credential binding alone; see [Chapter 5](#5-attestation-usage). A sub-type Rulebook silent on this point inherits the default device-binding requirement.

#### Claim naming policy

All claims defined by this Rulebook are **Private Claim Names** as defined in [RFC 7519], scoped by the `vct` specified above. This Rulebook does not introduce, and SHALL NOT be extended to introduce, IANA-registered claim names or URI-form Public Names. Each claim identifier SHALL be lower_snake_case ASCII and SHALL be unique within the scope of this Rulebook and its sub-types. Sub-type Rulebooks extending this base SHALL follow the same policy, MUST NOT redefine the meaning of any identifier defined here, and when specifying new attributes SHOULD consider existing identifier conventions and syntaxes. This selection exclusively elects the Private Claim Name option of [RFC 7519].

#### Private claims defined by this Rulebook

A JSON string used in an SD-JWT VC-encoded permit SHALL be encoded in UTF-8 and SHALL support the full Unicode range, unless explicitly specified otherwise in the table below or the references therein.

The **Selectively disclosable** column specifies, for each claim, whether the Attestation Provider must, may, or must not render that claim selectively disclosable: **MUST** — the Attestation Provider SHALL render this claim selectively disclosable using the mechanism of [SD-JWT VC]; **MAY** — at the Attestation Provider's choice; **MUST NOT** — the claim SHALL be included as a directly-disclosed value in the SD-JWT payload, with no selective-disclosure digest.

The following Private Names specific to the attestation type defined in this document are to be used for permits:

| **Data Identifier**        | **Attribute identifier**   | **Encoding format**         | **Notes**                                                                                   | **Selectively disclosable** |
| -------------------------- | -------------------------- | --------------------------- | ------------------------------------------------------------------------------------------- | --------------------------- |
| upl_naam                   | upl_naam                   | string                      | Defined in [Section 3.2](#32-mandatory-attributes). Value drawn from the Dutch UPL register | MUST                        |
| product_naam               | product_naam               | string                      | Defined in [Section 3.2](#32-mandatory-attributes)                                          | MUST                        |
| product_type_code          | product_type_code          | string                      | Defined in [Section 3.2](#32-mandatory-attributes)                                          | MUST                        |
| kenmerk                    | kenmerk                    | string                      | Defined in [Section 3.2](#32-mandatory-attributes). Unique reference of the issued permit   | MUST                        |
| geldig_van                 | geldig_van                 | full-date ([RFC 3339])      | Defined in [Section 3.2](#32-mandatory-attributes). Administrative start of validity        | MUST                        |
| geldig_tot                 | geldig_tot                 | full-date ([RFC 3339])      | Defined in [Section 3.2](#32-mandatory-attributes). Administrative end of validity          | MUST                        |
| issuing_authority          | issuing_authority          | string                      | Defined in [Section 3.5](#35-mandatory-metadata)                                            | MUST NOT                    |
| issuing_country            | issuing_country            | string (ISO 3166-1 alpha-2) | Defined in [Section 3.5](#35-mandatory-metadata)                                            | MUST NOT                    |
| attestation_legal_category | attestation_legal_category | string                      | Defined in [Section 3.5](#35-mandatory-metadata). Fixed value `"PuB-EAA"`                   | MUST NOT                    |
| cryptographically_bound_to | cryptographically_bound_to | string                      | See [Section 3.5](#35-mandatory-metadata); default `urn:eudi:pid:<cc>:1`. Sub-type MAY override.| MUST NOT                    |

#### Envelope claims populated by Attestation Providers

The following JWT and SD-JWT VC envelope claims SHALL be populated as indicated. These claims are not defined by this Rulebook; their syntax and semantics are governed by the cited specifications.

| **Claim** | **Source**  | **Population rule**                                                                          |
| --------- | ----------- | -------------------------------------------------------------------------------------------- |
| iss       | [RFC 7519]  | The Attestation Provider's identifier as registered in the QTSP Trusted List; see Chapter 6. |
| iat       | [RFC 7519]  | Time of issuance.                                                                            |
| nbf       | [RFC 7519]  | NumericDate for 00:00:00 UTC on the date given by `geldig_van`.                              |
| exp       | [RFC 7519]  | NumericDate for 00:00:00 UTC on the day immediately following `geldig_tot`.                  |
| cnf       | [SD-JWT VC] | Public key of the device-bound key pair; see [Key binding (`cnf`)](#key-binding-cnf).        |
| vct       | [SD-JWT VC] | The URN defined in [Verifiable Credential Type (`vct`)](#verifiable-credential-type-vct).    |

Because `geldig_van` and `geldig_tot` are `full-date` values (no time component) while `nbf` and `exp` are NumericDate values (seconds since epoch, per [RFC 7519]), `exp` is set to the start of the day *after* `geldig_tot` so that the attestation remains valid throughout the entirety of the `geldig_tot` calendar day in UTC.

#### Examples

EXAMPLE: The following non-normative example shows the payload of a permit attestation in SD-JWT VC format before encoding into the SD-JWT format. It illustrates the default binding pattern described in [Chapter 2](#2-extension-model): the attestation is device-bound (`cnf` present) and cross-credential-bound to the User's PID (`cryptographically_bound_to: "urn:eudi:pid:nl:1"`). The concrete `vct` corresponds to a hypothetical `standplaats` sub-type extending the base.

```json
{
    "iss": "https://permits.nijmegen.nl",
    "iat": 1778495400,
    "nbf": 1767225600,
    "exp": 1798848000,
    "vct": "urn:eudi:nl:vng:permit:standplaats:v1",

    "upl_naam": "Standplaatsvergunning",
    "product_naam": "Demo Standplaatsvergunning",
    "product_type_code": "test-vierdaagse",
    "kenmerk": "7f1aa4b5-3193-49d6-ba76-063e797f1e3f",
    "geldig_van": "2026-01-01",
    "geldig_tot": "2027-01-01",

    "issuing_authority": "Gemeente Nijmegen",
    "issuing_country": "NL",
    "attestation_legal_category": "PuB-EAA",
    "cryptographically_bound_to": "urn:eudi:pid:nl:1",

    "cnf": {
        "jwk": {
            "kty": "EC",
            "crv": "P-256",
            "x": "52aDI_ur05n1f_p3jiYGUU82oKZr3m4LsAErM536crQ",
            "y": "ckhZ-KQ5aXNL91R8Eufg1aOf8Z5pZJnIvuCzNGfdnzo"
        }
    }
}
```

Note: The `cnf` claim carries the public key of the device-bound key pair (see [Key binding (`cnf`)](#key-binding-cnf)); the example above shows a P-256 public key in JWK format.

Note: `nbf` is the NumericDate for 00:00:00 UTC on `geldig_van` (2026-01-01); `exp` is the NumericDate for 00:00:00 UTC on the day after `geldig_tot` (2027-01-02), so that the attestation remains valid for the entirety of 2027-01-01 UTC.

Note: Additional technical claims and JWS header fields are not shown here, including the `x5c` header conveying the location of the qualified certificate used to sign the PuB-EAA (see [Chapter 6](#6-trust-anchors)) and any status information (see [Chapter 7](#7-revocation)). The selective-disclosure digests (`_sd`, `_sd_alg`) and salts produced when claims marked **MUST** in [Section Private claims](#private-claims-defined-by-this-rulebook) are rendered selectively disclosable are likewise omitted; they appear in the encoded SD-JWT shown in the next example.

### 4.3 W3C Verifiable Credentials Data Model-based encoding

Attestations of this type SHALL NOT be issued in the [W3C VCDM v2.0] format; see Section 4.2 for the exclusive encoding.

## 5 Attestation usage

A permit attestation is presented online by a Wallet Unit to a Relying Party (for example a municipal service desk, an enforcement officer's mobile app, or an event organiser) that needs to verify whether the User holds a valid permit of a given type. Specific permit Rulebooks extending this base Rulebook describe the concrete use cases for their permit type.

**Device binding.** By default, permit attestations SHALL be device-bound. The SD-JWT VC SHALL contain a `cnf` claim carrying the public key of a key pair generated by the Wallet Unit's WSCA/WSCD; see Section 4.2. Device binding, taken on its own, only prevents the attestation from being transferred to another device — it does not, by itself, link the attestation to any other credential or to a natural or legal person. A sub-type Rulebook MAY waive device binding subject to the conditions in [Section 4.2](#42-sd-jwt-vc-based-encoding); a sub-type that waives device binding necessarily also waives the cross-credential binding specified below.

**Cross-credential cryptographic binding.** By default, permit attestations SHALL be cryptographically bound, during issuance, to the User's PID — whose `vct` is of the form `urn:eudi:pid:<cc>:1` (e.g. `urn:eudi:pid:nl:1`) — on the same Wallet Unit. A sub-type Rulebook extending this base MAY:

- specify a different anchor credential — for example a Chamber of Commerce registration attestation for a business-related permit, or an RDW vehicle-keeper attestation for a vehicle-related permit — by overriding the value of `cryptographically_bound_to` with the `vct` of that anchor; or
- waive cross-credential binding entirely, in which case the `cryptographically_bound_to` field SHALL be omitted from issued attestations. A sub-type Rulebook silent on this point inherits the default (PID-anchored binding).

The selected anchor credential SHALL itself be a device-bound credential issued to the same Wallet Unit. Where this Rulebook applies cross-credential binding (whether to the PID by default or to an anchor specified by a sub-type), the following requirements SHALL be met:

1. Before issuing the permit, the Attestation Provider SHALL verify that the permit indeed belongs to the entity identified by the anchor credential.
2. The Attestation Provider SHALL request and obtain a proof that the private key of the permit attestation is managed by the same WSCA/WSCD as the private key of the anchor credential.
3. The Attestation Provider SHALL NOT issue the permit if this proof cannot be obtained.
4. The metadata field `cryptographically_bound_to` (see [Section 3.5](#35-mandatory-metadata)) SHALL be present in every permit and SHALL carry the `vct` of the anchor credential.

**Relying Party obligations.** A Relying Party verifying a permit SHALL:

- Verify the qualified electronic signature or seal of the issuing PuB-EAA Provider over the SD-JWT VC, including the certificate chain up to the QTSP trust anchor (see Chapter 6).
- Verify the technical validity period of the SD-JWT VC (`nbf`, `exp`) and the administrative validity period (`geldig_van`, `geldig_tot`).
- If a `cnf` claim is present, verify the key-binding signature created using the private key referenced by it, as specified in [SD-JWT VC] / [HAIP].
- Check the revocation status of the permit (see Chapter 7).

Whenever the Relying Party needs to identify the entity to whom the permit was granted, the Relying Party SHALL also request the anchor credential identified by the `cryptographically_bound_to` field from the Wallet Unit and SHALL request a proof of cryptographic binding between the permit and that anchor credential. For most personal permit use cases the anchor credential will be the User's PID; for business- or vehicle-related sub-type Rulebooks it may instead be a Chamber of Commerce or RDW attestation, as configured by that sub-type.

**Presentation.** Permit attestations are presented exclusively online, using the [HAIP] profile of OpenID4VP. Proximity/offline presentation using [ISO/IEC 18013-5] is not supported (see Section 4.1).

**Transactional data.** Permit attestations do not carry transactional data in the payment-related sense used by the ARF.

**Re-issuance.** Re-issuance of permits is currently governed only by the issuance requirements inherited from the ARF: for device-bound attestations, refresh tokens SHALL be bound to the same WSCA/WSCD as the replaced attestation; for non-device-bound attestations (still a draft topic in the ARF), refresh tokens SHALL still be bound to a WSCA/WSCD on the same Wallet Unit. This Rulebook does not pin a maximum refresh cadence, nor whether re-authentication of the anchor credential is required on each refresh.

*Open question for the Scheme Provider: a future version of this Rulebook may pin refresh cadence and anchor re-authentication policy — for example, bearer permits might be required to be re-issued every 24h with re-authentication, while PID-bound permits might allow silent refresh against an unchanged WSCA/WSCD-bound PID for the lifetime of the permit.*

## 6 Trust anchors

*Mechanisms for the provision of a trust anchor that SHALL
be used for the verification of an attestation SHALL be defined in this section.*

The ARF specifies the following for PuB-EAAs:

> For PuB-EAAs, the Relying Party Instance verifies a PuB-EAA by first
verifying the signature of the PuB-EAA Provider over the PuB-EAA, using the
PuB-EAA Provider certificate issued by a QTSP. Subsequently, the Relying Party
Instance verifies the signature over this certificate, using the corresponding
trust anchor from the QTSP Trusted List. Note that both the PuB-EAA Provider
and the QTSP may use an intermediate signing certificate.

## 7 Revocation

(Refer to the ARF for the list of High-Level Requirements related to Revocation.)

*In this section information about the revocation mechanism used SHALL be defined.*

For PuB-EAA it SHALL be defined whether only short-lived attestations will be used, having a validity period of 24 hours or less, such that revocation will never be necessary, or that the attestations are revocable.

*For revocable attestations it SHALL be defined which of the following methods must be implemented:*

- Use an Attestation Status List mechanism included in a Technical Specification
that will be specified by the Commission.
- Use an Attestation Revocation List mechanism included in a Technical Specification
that will be specified by the Commission.

*Open question for the Scheme Provider: the revocation mechanism is currently inherited rulebook-wide. A future version of this Rulebook may pin different mechanisms for different permit classes — short-lived (≤ 24h), Attestation Status List, or Attestation Revocation List — so that, for example, bearer day-passes and long-lived business operating permits do not have to use the same mechanism.*

## 8 Compliance

This chapter records the compliance of this Rulebook with Annex VII of the [European Digital Identity Regulation] (the binding regulatory requirement) and with Topic 12 of the ARF (*Attestation Rulebooks*) (the technical companion to the regulation). The two cross-walks below are the authoritative compliance statement for this Rulebook. The rule identifiers `ARB_01` through `ARB_34` do not appear elsewhere in this document.

### 8.1 Annex VII of the [European Digital Identity Regulation]

The nine points of Annex VII enumerate the contents that an electronic attestation issued by or on behalf of a public sector body responsible for an authentic source (a PuB-EAA) must contain. Points already wrapped by an ARB rule defer to that row in the table of [Section 8.2](#82-topic-12-of-the-arf--attestation-rulebook-requirements).

| Point | Subject                                                    | Applicable              | Where satisfied                                               |
| ----- | ---------------------------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| (a)   | Indication that the attestation is a PuB-EAA               | Covered by ARB_11       | §3.5 — `attestation_legal_category` fixed to `"PuB-EAA"`      |
| (b)   | Data representing the issuing public body                  | Covered by ARB_14       | §3.5 — `issuing_authority`, `issuing_country`                 |
| (c)   | Data representing the subject entity                       | Covered by ARB_16       | §3.5, Chapter 5 — `cryptographically_bound_to` (default: PID) |
| (d)   | The attested attribute(s)                                  | Yes — no ARB equivalent | Chapter 3 — the attribute set defined by this Rulebook        |
| (e)   | Validity period                                            | Covered by ARB_18       | §3.2 (`geldig_van`, `geldig_tot`); §4.2 (`nbf`, `exp`)        |
| (f)   | Attestation identity code + scheme of attestations         | Yes — no ARB equivalent | §3.2 — `kenmerk`; §4.2 — `vct` URN                            |
| (g)   | Qualified electronic signature or seal of the issuing body | Yes — no ARB equivalent | Qualified signature over the SD-JWT VC; Chapter 6             |
| (h)   | Location of the qualified certificate signing the PuB-EAA  | Covered by ARB_20       | Chapter 6 (QTSP Trusted List) + `x5c` JWS header (§4.2)       |
| (i)   | Information for enquiring about validity status            | Yes — no ARB equivalent | Chapter 7 — concrete mechanism to be pinned (open question)   |

### 8.2 Topic 12 of the ARF — Attestation Rulebook requirements

The **Applies** column has three values:

- **Yes** — the requirement applies to this Rulebook and is satisfied as indicated.
- **No** — the requirement is conditional and the condition does not hold for this Rulebook (for example, the rule applies only to non-qualified EAAs, or only to a format this Rulebook does not adopt).
- **Deferred** — the base sets a default but explicitly delegates the concrete choice to sub-type Rulebooks or to a separate procedural step.

| ARB     | Topic 12 subject                                                        | Applies               | Where satisfied                                                              |
| ------- | ----------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------- |
| ARB_01  | Format choice (QEAA / PuB-EAA): mdoc and/or SD-JWT VC                   | Yes                   | §4.1 (mdoc excluded); §4.2 (SD-JWT VC adopted)                               |
| ARB_01a | Format choice for non-qualified EAA                                     | No                    | Not a non-qualified EAA                                                      |
| ARB_01b | SD-JWT VC complies with the [HAIP] profile                              | Yes                   | §4.2                                                                         |
| ARB_02  | Analyse proximity need; mandate mdoc if present                         | Yes                   | §4.1 — proximity/offline presentation not required for permits               |
| ARB_03  | SD-JWT VC permitted as format                                           | Yes                   | §4.2 — exercised                                                             |
| ARB_04  | Reference detail for W3C VCDM-compliant attestations                    | No                    | §4.3 — W3C VCDM not used                                                     |
| ARB_05  | Unique attestation type value                                           | Yes                   | §4.2 — URN `urn:eudi:nl:vng:permit:v1`                                       |
| ARB_06  | Define all attributes in an encoding-independent manner                 | Yes                   | Chapter 3                                                                    |
| ARB_06a | Attribute namespace for mdoc attestations                               | No                    | mdoc not issued (§4.1)                                                       |
| ARB_06b | Claim naming for SD-JWT VC attestations                                 | Yes                   | §4.2 — Private Claim Names per [RFC 7519]                                    |
| ARB_07  | Prefer attributes from existing catalogues                              | Yes                   | §3.1; §4.2 — UPL vocabulary reused for `upl_naam`                            |
| ARB_08  | Reuse existing identifier conventions and syntaxes                      | Yes                   | §4.2 — `lower_snake_case` ASCII identifiers                                  |
| ARB_09  | Mark each attribute mandatory / optional / conditional                  | Yes                   | §3.2 – §3.7                                                                  |
| ARB_10  | Domestic mdoc namespace                                                 | No                    | mdoc not issued (§4.1)                                                       |
| ARB_11  | Annex VII point (a) — indication that the attestation is a PuB-EAA      | Yes                   | §3.5 — `attestation_legal_category` fixed to `"PuB-EAA"`                     |
| ARB_12  | Annex V point (a) — indication for non-qualified EAA                    | No                    | Not a non-qualified EAA                                                      |
| ARB_13  | Annex V point (b) — issuing QTSP data for a QEAA                        | No                    | Not a QEAA                                                                   |
| ARB_14  | Annex VII point (b) — data representing the issuing public body         | Yes                   | §3.5 — `issuing_authority`, `issuing_country`                                |
| ARB_15  | Annex V point (b) for non-qualified EAA                                 | No                    | Not a non-qualified EAA                                                      |
| ARB_16  | Annex V / VII point (c) — data representing the subject entity          | Yes                   | §3.5, Chapter 5 — `cryptographically_bound_to` (default: PID)                |
| ARB_17  | Annex V point (c) for non-qualified EAA                                 | No                    | Not a non-qualified EAA                                                      |
| ARB_18  | Annex V / VII point (e) — validity period                               | Yes                   | §3.2 (`geldig_van`, `geldig_tot`); §4.2 (`nbf`, `exp`)                       |
| ARB_19  | Annex V point (e) for non-qualified EAA                                 | No                    | Not a non-qualified EAA                                                      |
| ARB_20  | Annex V / VII point (h) — qualified certificate / trust anchor location | Yes                   | Chapter 6 (QTSP Trusted List) + `x5c` JWS header (§4.2)                      |
| ARB_21  | Trust-anchor location for non-qualified EAA                             | No                    | Not a non-qualified EAA                                                      |
| ARB_22  | Technical details for interoperability, security, and privacy           | Yes                   | Document as a whole                                                          |
| ARB_23  | Revocation mechanism selection from Topic 7                             | Yes — pending         | Chapter 7 — concrete mechanism to be pinned (open question)                  |
| ARB_24  | Revocability of non-qualified EAA                                       | No                    | Not a non-qualified EAA                                                      |
| ARB_25  | Include `attestation_legal_category` from the template                  | Yes                   | §3.5 — value `"PuB-EAA"`                                                     |
| ARB_26  | Trust-anchor distribution for non-qualified EAA                         | No                    | Not a non-qualified EAA                                                      |
| ARB_27  | (empty in Topic 12)                                                     | —                     | —                                                                            |
| ARB_28  | `cryptographically_bound_to` attribute and its semantics                | Yes                   | §3.5, Chapter 5                                                              |
| ARB_29  | Follow the Attestation Rulebook Template                                | Yes                   | Overall document structure                                                   |
| ARB_30  | Per-claim selective disclosure for SD-JWT VC                            | Yes                   | §4.2 — column **Selectively disclosable**                                    |
| ARB_31  | Consider a Type Metadata Document for SD-JWT VC                         | Yes (SHOULD-consider) | §4.2 — declared OPTIONAL; reasoning given                                    |
| ARB_32  | (empty in Topic 12)                                                     | —                     | —                                                                            |
| ARB_33  | Cross-link from catalogue of attestation schemes to this Rulebook       | Deferred              | Performed at registration per [Commission Implementing Regulation 2025/1569] |
| ARB_34  | State whether the attestation is device-bound                           | Yes                   | §4.2 *Key binding*, Chapter 5 — device-bound by default                      |

## 9 References

| **Item Reference**                     | **Standard name/details**                                                                                                                                                                                                                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [European Digital Identity Regulation] | [Regulation (EU) 2024/1183](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401183) of the European Parliament and of the Council of 11 April 2024 amending Regulation (EU) No 910/2014 as regards establishing the European Digital Identity Framework                            |
| [HAIP]                                 | Yasuda, K. *et al,* OpenID4VC High Assurance Interoperability Profile, OpenId Foundation, Version draft-03                                                                                                                                                                                          |
| [IANA-JWT-Claims]                      | IANA JSON Web Token Claims Registry. Available: <https://www.iana.org/assignments/jwt/jwt.xhtml>                                                                                                                                                                                                    |
| [ISO/IEC 18013-5]                      | ISO/IEC 18013-5, Personal identification --- ISO-compliant driving licence - Part 5: Mobile driving licence (mDL) application, First edition, 2021-09                                                                                                                                               |
| [OIDC]                                 | Sakimura, N. et al., "OpenID Connect Core 1.0", OpenID Foundation. Available: <https://openid.net/specs/openid-connect-core-1_0.html>                                                                                                                                                               |
| [RFC 3339]                             | RFC 3339  - Date and Time on the Internet: Timestamps, G. Klyne et al., July 2002                                                                                                                                                                                                                   |
| [RFC 8610]                             | RFC 8610  - Concise Data Definition Language (CDDL): A Notational Convention to Express Concise Binary Object Representation (CBOR) and JSON Data Structures, H. Birkholz et al., June 2019                                                                                                         |
| [RFC 8943]                             | RFC 8943  - Concise Binary Object Representation (CBOR) Tags for Date, M. Jones et al., November 2020                                                                                                                                                                                               |
| [RFC 8949]                             | RFC 8949 - Concise Binary Object Representation (CBOR), C. Bormann et al., December 2020                                                                                                                                                                                                            |
| [SD-JWT VC]                            | SD-JWT-based Verifiable Credentials (SD-JWT VC). Available: <https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/>, version draft-ietf-oauth-sd-jwt-vc-09                                                                                                                                   |
| [W3C VCDM v2.0]                        | Sporny, M. *et al,* Verifiable Credentials Data Model v2.0, W3C Recommendation.                                                                                                                                                                                                                     |