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
  - [2 Extension by sub-type Rulebooks](#2-extension-by-sub-type-rulebooks)
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

## 2 Extension by sub-type Rulebooks

Concrete permit types (for example *standplaatsvergunning*, *evenementenvergunning*) are defined by **sub-type Rulebooks** that extend this base. A sub-type Rulebook inherits every requirement of this base Rulebook unchanged, MAY add type-specific attributes following the claim-naming policy in [Section 4.2](#42-sd-jwt-vc-based-encoding), and MAY tighten an inherited requirement (e.g. raise OPTIONAL to MANDATORY), but SHALL NOT loosen one except through the knobs listed below. Claim semantics, the base `vct` URN structure, and the fixed value `"PuB-EAA"` of `attestation_legal_category` SHALL NOT be changed. A sub-type Rulebook silent on a knob inherits the default.

| Knob                                                                         | Override choices                                                                                                                    | Cascading consequences                                                                                                                                                                                                                  |
|------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Device binding (`cnf`) — [Section 4.2](#42-sd-jwt-vc-based-encoding)         | (a) **keep** (default); (b) **waive**                                                                                               | If waived: omit `cnf`; cross-credential binding is force-waived (it is built on device binding); omit `cryptographically_bound_to`; conform to ISSU_66 of [Topic Z] for refresh-token re-issuance.                                      |
| Cross-credential cryptographic binding — [Chapter 5](#5-attestation-usage)   | (a) **keep PID anchor** (default, `vct = "urn:eudi:pid:1"`); (b) **override anchor** to another credential's `vct`; (c) **waive**   | If overridden: chosen anchor SHALL itself be device-bound and issued to the same Wallet Unit; `cryptographically_bound_to` carries the new `vct`. If waived: omit `cryptographically_bound_to`; device binding MAY still be retained.   |

## 3 Attestation attributes and metadata

### Chapter overview and requirements

This chapter defines, in an encoding-independent manner, all attributes and metadata that a permit attestation conforming to this Rulebook may contain (ARB_06). Each field is classified as mandatory, optional, or conditional in the corresponding subsection (ARB_09). Where applicable, identifiers reuse established Dutch public-sector vocabularies (notably the Uniforme Productnamenlijst) rather than introducing new terms (ARB_07).

Permit attestations defined by this Rulebook are PuB-EAAs. The requirements from [Topic 12] for PuB-EAAs map to fields specified in Sections 2.2 and 2.5 as follows:

- **ARB_11** — Annex VII point (a), indication that the attestation is a PuB-EAA: satisfied by the `attestation_legal_category` metadata field (Section 3.5), with fixed value `"PuB-EAA"`. See Section 3.1.
- **ARB_14** — Annex VII point (b), data unambiguously representing the issuing public body: satisfied by the `issuing_authority` and `issuing_country` metadata fields (Section 3.5).
- **ARB_16** — Annex VII point (c), data unambiguously representing the entity to which the attributes refer: satisfied via cryptographic binding to an anchor credential — by default the User's PID, optionally overridden by a sub-type Rulebook (for example to a Chamber of Commerce registration or RDW vehicle-keeper attestation) — rather than duplicate subject claims. The binding is advertised by the `cryptographically_bound_to` metadata field (Section 3.5) and enforced at issuance per Chapter 5.
- **ARB_18** — Annex VII point (e), validity period: satisfied by the `geldig_van` and `geldig_tot` attributes (Section 3.2), reflected at the SD-JWT VC level by the `nbf` and `exp` claims (Section 4.2).
- **ARB_20** — Annex VII point (h), location of the qualified certificate that signed the PuB-EAA: satisfied via the `x5c` JWS header of the SD-JWT VC together with the QTSP Trusted List trust anchor mechanism specified in Chapter 6.

### 3.1 Introduction

This Rulebook defines the base permit attestation type shared by every permit attestation issued under this scheme. Specific permit categories (e.g. street-trading, event, parking) are defined in sub-type Rulebooks that extend this base.

Within the base, the kind of permit is conveyed by claim *values*, not by the attribute set:

- `upl_naam` is the sole cross-authority semantic anchor, carrying the standardised name from the Dutch Uniforme Productnamenlijst (UPL).
- `product_naam` and `product_type_code` are local to the granting authority (typically a municipality) and SHALL NOT be relied upon for cross-authority semantics.

Sub-type Rulebooks MAY add type-specific attributes and metadata, but SHALL inherit, and SHALL NOT redefine or remove, any mandatory attribute or metadata field defined here.

According to Annex VII point (a) of the [European Digital Identity Regulation], an indication, at least in a form suitable for automated processing, that the attestation has been issued as a PuB-EAA must be defined. This Rulebook satisfies that requirement through the `attestation_legal_category` metadata field, which for permits is always `"PuB-EAA"`.

The set of data unambiguously representing the entity to which the attested attributes refer, as required by Annex VII point (c) of the [European Digital Identity Regulation], is not duplicated as subject attributes inside the permit. Instead, by default, the permit attestation SHALL be cryptographically bound during issuance, in accordance with ACP_05 and ACP_07 of [Topic 18], to the User's PID (`vct = urn:eudi:pid:1`) on the same Wallet Unit. The identity of the entity to whom the permit was granted is therefore conveyed by the bound anchor credential at presentation time. This approach complies with the data-minimisation principle: a Relying Party only learns the anchor credential's attributes when those are explicitly requested.

A sub-type Rulebook extending this base MAY override the anchor credential type — for example to a Chamber of Commerce registration attestation for business-related permits, or to an RDW vehicle-keeper attestation for vehicle-related permits — or MAY waive cross-credential binding entirely. The override mechanism is specified in [Section 4.2](#42-sd-jwt-vc-based-encoding) (for the underlying device-binding requirement) and [Chapter 5](#5-attestation-usage) (for the cross-credential binding requirement). The metadata field `cryptographically_bound_to`, specified in [Section 3.5](#35-mandatory-metadata) below, advertises the selected binding to Relying Parties.

The indication of the scheme of attestations required by Annex VII point (f) of the [European Digital Identity Regulation] is conveyed by the `vct` claim defined in [Section 4.2](#42-sd-jwt-vc-based-encoding). The base `vct` for permits defined by this Rulebook is the URN `urn:eudi:nl:vng:permit:1`. Sub-type Rulebooks (e.g. for a specific permit type such as street trading) extend this base by appending a type segment before the version, for example `urn:eudi:nl:vng:permit:streettrading:1`.

Sections 2.2 - 2.7 list each attribute and metadata field with its data identifier, semantic definition, data type, and an example value. Identifiers are lowercase snake_case and machine-readable.

### 3.2 Mandatory attributes

| **Data Identifier** | **Definition**                                                                            | **Data type** | **Example value**                    |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------- | ------------------------------------ |
| upl_naam            | Standardized product name as defined in the Dutch Uniforme Productnamenlijst (UPL).       | string        | Standplaatsvergunning                |
| product_naam        | Human-readable name of the specific permit as issued by the granting authority.           | string        | Demo Standplaatsvergunning           |
| product_type_code   | Code identifying the product/permit type.                                                 | string        | test-vierdaagse                      |
| kenmerk             | Unique reference number assigned by the granting authority to identify the issued permit. | string        | 7f1aa4b5-3193-49d6-ba76-063e797f1e3f |
| geldig_van          | Start date of validity for this permit.                                                   | full-date     | 2026-01-01                           |
| geldig_tot          | End date of validity for this permit.                                                     | full-date     | 2027-01-01                           |

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
| cryptographically_bound_to | Identifier (`vct`) of the anchor credential bound to this attestation via the shared WSCA/WSCD per ACP_05 of [Topic 18]. Default `urn:eudi:pid:1`. See note below and Chapter 5.                                                                                                                                           | string (vct)  | urn:eudi:pid:1    |

Note on `cryptographically_bound_to`. The default anchor for permit attestations defined by this base Rulebook is the User's PID (`urn:eudi:pid:1`). A sub-type Rulebook extending this base MAY specify a different anchor credential type whose `vct` reflects the entity to which the permit's attributes refer — for example a Chamber of Commerce registration attestation for business-related permits, or an RDW vehicle-keeper attestation for vehicle-related permits. A sub-type Rulebook MAY also waive cross-credential binding entirely (consistent with waiving device binding per Section 4.2), in which case the `cryptographically_bound_to` field SHALL be omitted from issued attestations. A sub-type Rulebook silent on this point inherits the default. The selected anchor credential SHALL itself be a device-bound PID or attestation issued to the same Wallet Unit, so that the WSCA/WSCD-shared-key proof of ACP_05 can be obtained.

### 3.6 Optional metadata

Not specified.

### 3.7 Conditional metadata

Not specified.

## 4 Attestation encoding

### 4.1 ISO/IEC 18013-5-compliant encoding

Attestations of this type SHALL NOT be issued in the [ISO/IEC 18013-5] mdoc format. Proximity/offline presentation is not required (ARB_02); see Section 4.2 for the exclusive encoding.

### 4.2 SD-JWT VC-based encoding

Attestations of this type SHALL be encoded as SD-JWT VC, complying with the 'SD-JWT VCs' profile specified in [HAIP] (see ARB_01b in [Topic 12]).

#### Verifiable Credential Type (`vct`)

The Verifiable Credential Type for permits defined by this Rulebook is the URN:

```text
urn:eudi:nl:vng:permit:v1
```

This URN is unique within the EUDI Wallet ecosystem (ARB_05) and serves as the indication of the scheme of attestations required by Annex VII point (f) of the [European Digital Identity Regulation]. It identifies the attestation type/scheme defined by Vereniging van Nederlandse Gemeenten (VNG) as Scheme Provider; it does not identify the Attestation Provider that issued any particular credential of this type. Every Attestation Provider issuing permits of this type SHALL include this exact URN in the `vct` claim, regardless of the Provider's internal catalog or hosting infrastructure.

Attestation Rulebooks for specific permit types SHALL extend this base by appending a type segment before the version, e.g.:

```text
urn:eudi:nl:vng:permit:streettrading:v1
urn:eudi:nl:vng:permit:evenementen:v1
urn:eudi:nl:vng:permit:standplaats:v1
```

Sub-type Rulebooks SHALL inherit all mandatory attributes and metadata from this base Rulebook and MAY define additional type-specific attributes, using the `extends` mechanism specified in Chapter 6 of [SD-JWT VC]. Sub-type Rulebooks MAY evolve their version segment independently of the base version.

The major version `:v1` covers all backwards-compatible refinements to the schema. The version SHALL be incremented for any change that breaks this contract — that is, any change that could cause a previously-conforming credential to be rejected by an updated Verifier, or cause a conforming Verifier or Wallet to misinterpret a credential, lose a cryptographic guarantee, or fail to process it.

#### Type Metadata Document

Defining a Type Metadata Document as described in Chapter 6 of [SD-JWT VC] is OPTIONAL for this Rulebook (per ARB_31, which is a SHOULD-consider requirement). Because the `vct` defined in this Rulebook is a URN, it is not dereferenceable and no metadata-discovery endpoint is provided; the authoritative scheme definition is this Rulebook. Attestation Providers MAY include a `vct#integrity` claim in issued credentials, computed as a Subresource Integrity hash over a Type Metadata Document consistent with this Rulebook. The mechanism by which a Verifier obtains that document is out of scope for this Rulebook.

#### Key binding (`cnf`)

By default, permit attestations defined by this base Rulebook or any sub-type Rulebook extending it SHALL be device-bound. The SD-JWT VC SHALL contain a `cnf` claim as specified in [SD-JWT VC], carrying the public key of a key pair generated by the Wallet Unit's WSCA/WSCD specifically for this attestation.

Device binding, on its own, only guarantees that the attestation cannot be transferred to another device: it binds the attestation to a private key held in the Wallet Unit's WSCA/WSCD, and to nothing else. It does not, by itself, tie the attestation to any other credential in the Wallet Unit or to any natural or legal person. Cross-credential cryptographic binding (for example, to the User's PID, a Chamber of Commerce registration, or another anchor credential) is a separate concern, specified in [Chapter 5](#5-attestation-usage), and is built on top of device binding via ACP_05 of [Topic 18].

A sub-type Rulebook extending this base MAY waive the device-binding requirement (consistent with the SHOULD verb of ISSU_27 in [Annex 2] and the Scheme Provider's discretion under ARB_30). A sub-type Rulebook that waives device-binding SHALL state so explicitly, SHALL omit the `cnf` claim from issued credentials, and SHALL also waive the cross-credential cryptographic binding specified in Chapter 5 — because that mechanism is built on top of device binding — and SHALL omit the `cryptographically_bound_to` metadata field (see [Section 3.5](#35-mandatory-metadata)). A sub-type Rulebook that retains device-binding MAY independently waive cross-credential binding alone; see [Chapter 5](#5-attestation-usage). A sub-type Rulebook silent on this point inherits the default device-binding requirement.

#### Claim naming policy

All claims defined by this Rulebook are **Private Claim Names** as defined in [RFC 7519], scoped by the `vct` specified above. This Rulebook does not introduce, and SHALL NOT be extended to introduce, IANA-registered claim names or URI-form Public Names. Each claim identifier SHALL be lower_snake_case ASCII and SHALL be unique within the scope of this Rulebook and its sub-types. Sub-type Rulebooks extending this base SHALL follow the same policy, SHALL NOT redefine the meaning of any identifier defined here, and when specifying new attributes SHOULD consider existing identifier conventions and syntaxes (ARB_07). This selection exclusively elects the Private Claim Name option of [RFC 7519] and thereby satisfies ARB_06b.

The JWT and SD-JWT VC envelope claims — `iss`, `iat`, `exp`, `nbf`, `cnf`, `vct`, `vct#integrity` (where present), `_sd`, and `_sd_alg` — are governed by [RFC 7519] and [SD-JWT VC] respectively and are out of scope for this policy; they are used as defined in those specifications.

#### Private claims defined by this Rulebook

A JSON string used in an SD-JWT VC-encoded permit SHALL be encoded in UTF-8 and SHALL support the full Unicode range, unless explicitly specified otherwise in the table below or the references therein.

The **Selectively disclosable** column specifies the selective-disclosure requirement (per ARB_30): **MUST** — the Attestation Provider SHALL render this claim selectively disclosable using the mechanism of [SD-JWT VC]; **MAY** — at the Attestation Provider's choice; **MUST NOT** — the claim SHALL be included as a directly-disclosed value in the SD-JWT payload, with no selective-disclosure digest.

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
| cryptographically_bound_to | cryptographically_bound_to | string                      | See [Section 3.5](#35-mandatory-metadata); default `urn:eudi:pid:1`, sub-type MAY override. | MUST NOT                    |

Note: the standard JWT claims `nbf` and `exp` are used to express the technical validity period of an SD-JWT VC-compliant permit; see the envelope-claim mapping below.

#### Envelope claims populated by Attestation Providers

The following JWT and SD-JWT VC envelope claims SHALL be populated as indicated. These claims are not defined by this Rulebook; their syntax and semantics are governed by the cited specifications.

| **Claim** | **Source**  | **Population rule**                                                                          |
| --------- | ----------- | -------------------------------------------------------------------------------------------- |
| iss       | [RFC 7519]  | The Attestation Provider's identifier as registered in the QTSP Trusted List; see Chapter 6. |
| iat       | [RFC 7519]  | Time of issuance.                                                                            |
| nbf       | [RFC 7519]  | Set equal to `geldig_van` (administrative start of validity).                                |
| exp       | [RFC 7519]  | Set equal to `geldig_tot` (administrative end of validity).                                  |
| cnf       | [SD-JWT VC] | Public key of the device-bound key pair; see [Key binding (`cnf`)](#key-binding-cnf).        |
| vct       | [SD-JWT VC] | The URN defined in [Verifiable Credential Type (`vct`)](#verifiable-credential-type-vct).    |

#### Examples

[RULEBOOK AUTHOR TO PROVIDE AN EXAMPLE OF THE JWT CLAIM SET USED BY THE PROVIDER]

[RULEBOOK AUTHOR TO PROVIDE AN EXAMPLE OF THE ISSUED SD-JWT (IN base64 ENCODING)]

[RULEBOOK AUTHOR TO PROVIDE AN EXAMPLE OF A HUMAN READABLE VERSION OF THE SD-JWT PAYLOAD
AND A DESCRIPTION OF THE DISCLOSURES INCLUDED IN THE EXAMPLE]

### 4.3 W3C Verifiable Credentials Data Model-based encoding

Attestations of this type SHALL NOT be issued in the [W3C VCDM v2.0] format; see Section 4.2 for the exclusive encoding.

## 5 Attestation usage

A permit attestation is presented online by a Wallet Unit to a Relying Party (for example a municipal service desk, an enforcement officer's mobile app, or an event organiser) that needs to verify whether the User holds a valid permit of a given type. Specific permit Rulebooks extending this base Rulebook describe the concrete use cases for their permit type.

**Device binding (ARB_34).** By default, permit attestations SHALL be device-bound. The SD-JWT VC SHALL contain a `cnf` claim carrying the public key of a key pair generated by the Wallet Unit's WSCA/WSCD; see Section 4.2. Device binding, taken on its own, only prevents the attestation from being transferred to another device — it does not, by itself, link the attestation to any other credential or to a natural or legal person. A sub-type Rulebook MAY waive device binding subject to the conditions in [Section 4.2](#42-sd-jwt-vc-based-encoding); a sub-type that waives device binding necessarily also waives the cross-credential binding specified below.

**Cross-credential cryptographic binding (ARB_28, Topic 18).** By default, permit attestations SHALL be cryptographically bound, during issuance, to the User's PID with `vct = "urn:eudi:pid:1"` on the same Wallet Unit. A sub-type Rulebook extending this base MAY:

- specify a different anchor credential — for example a Chamber of Commerce registration attestation for a business-related permit, or an RDW vehicle-keeper attestation for a vehicle-related permit — by overriding the value of `cryptographically_bound_to` with the `vct` of that anchor; or
- waive cross-credential binding entirely, in which case the `cryptographically_bound_to` field SHALL be omitted from issued attestations. A sub-type Rulebook silent on this point inherits the default (PID-anchored binding).

The selected anchor credential SHALL itself be a device-bound credential issued to the same Wallet Unit. Where this Rulebook applies cross-credential binding (whether to the PID by default or to an anchor specified by a sub-type), the following requirements SHALL be met:

1. Before issuing the permit, the Attestation Provider SHALL verify that the permit indeed belongs to the entity identified by the anchor credential (ACP_07 of [Topic 18]).
2. The Attestation Provider SHALL request and obtain, in accordance with ACP_05 of [Topic 18], a proof that the private key of the permit attestation is managed by the same WSCA/WSCD as the private key of the anchor credential.
3. The Attestation Provider SHALL NOT issue the permit if this proof cannot be obtained.
4. The metadata field `cryptographically_bound_to` (see [Section 3.5](#35-mandatory-metadata)) SHALL be present in every permit and SHALL carry the `vct` of the anchor credential.

**Relying Party obligations.** A Relying Party verifying a permit SHALL:

- Verify the qualified electronic signature or seal of the issuing PuB-EAA Provider over the SD-JWT VC, including the certificate chain up to the QTSP trust anchor (see Chapter 6).
- Verify the technical validity period of the SD-JWT VC (`nbf`, `exp`) and the administrative validity period (`geldig_van`, `geldig_tot`).
- If a `cnf` claim is present, verify the key-binding signature created using the private key referenced by it, as specified in [SD-JWT VC] / [HAIP].
- Check the revocation status of the permit (see Chapter 7).

Whenever the Relying Party needs to identify the entity to whom the permit was granted, the Relying Party SHALL also request the anchor credential identified by the `cryptographically_bound_to` field from the Wallet Unit and SHALL request a proof of cryptographic binding between the permit and that anchor credential, as described in the note to ARB_28 in [Topic 12]. For most personal permit use cases the anchor credential will be the User's PID; for business- or vehicle-related sub-type Rulebooks it may instead be a Chamber of Commerce or RDW attestation, as configured by that sub-type.

**Presentation.** Permit attestations are presented exclusively online, using the [HAIP] profile of OpenID4VP. Proximity/offline presentation using [ISO/IEC 18013-5] is not supported (see Section 4.1).

**Transactional data.** Permit attestations do not carry transactional data in the sense of [Topic 20] of Annex 2 of the ARF.

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

(Refer to [Topic 7] of the ARF for a list of High-Level Requirements related to Revocation)

*In this section information about the revocation mechanism used SHALL be defined.*

For PuB-EAA it SHALL be defined whether only short-lived attestations will be used, having a validity period of 24 hours or less, such that revocation will never be necessary, or that the attestations are revocable.

*For revocable attestations it SHALL be defined which of the following methods must be implemented:*

- Use an Attestation Status List mechanism included in a Technical Specification
that will be specified by the Commission.
- Use an Attestation Revocation List mechanism included in a Technical Specification
that will be specified by the Commission.

## 8 Compliance

*In this section explicitly state how this specific rulebook complies with the
general EUDI framework, ARF, and relevant regulations*

[RULEBOOK AUTHOR TO DEFINE]

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
| [Topic 7]                              | ARF Annex 2 - Topic 7 - Attestation revocation and revocation checking Available: <https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/annexes/annex-2/annex-2-high-level-requirements/#a237-topic-7-attestation-revocation-and-revocation-checking>  |
| [Topic 10]                             | ARF Annex 2 - Topic 10 - Issuing a PID or attestation to a Wallet Unit: <https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/annexes/annex-2/annex-2-high-level-requirements/#a2310-topic-10-issuing-a-pid-or-attestation-to-a-wallet-unit>           |
| [Topic 12]                             | ARF Annex 2 - Topic 12 - Attestation Rulebooks, Available: <https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/annexes/annex-2/annex-2-high-level-requirements/#a2312-topic-12-attestation-rulebooks>                                                |
| [Topic 20]                             | ARF Annex 2 - Strong User authentication for electronic payments, Available: <https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/annexes/annex-2/annex-2-high-level-requirements/#a2320-topic-20-strong-user-authentication-for-electronic-payments> |
| [W3C VCDM v2.0]                        | Sporny, M. *et al,* Verifiable Credentials Data Model v2.0, W3C Recommendation.                                                                                                                                                                                                                     |