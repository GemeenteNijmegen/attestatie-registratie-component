| Version | Date       | Description                                                                                                                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 24-06-2025 | First version                                                                                                                                                                                    |
| 1.1     | 20-08-2025 | Allowing private names specific to the attestation type for JSON claims; adding requirements to specify whether a claim is selectively disclosable.                                              |
| 1.2     | 07-10-2025 | Fixing markdown issues; adding requirement to Chapter 4 regarding the need to specify whether an attestation is device-bound or non-device-bound.                                                |
| 1.3     | 02-12-2025 | Add complete change history; include the optional ``cryptographically_bound_to`` attribute specified in ARB_28; removed recommendation to define a JSON schema for SD-JWT VC-based attestations. |
| 1.4     | 09-03-2026 | Fixing incorrect 'device-bound' working related to cryptographically_bound_to attribute in chapter 4.                                                                                            |

# Attestation Rulebook for attestations of type Permits

*Provide information about the author(s) of this Rulebook in the following form:*

* Author(s):
    * Marnix Dessing (Gemeente Nijmegen)
    * Sten Reijers (Ver.iD)


**Feedback:**

* [https://https://github.com/GemeenteNijmegen/attestatie-registratie-component](https://github.com/GemeenteNijmegen/attestatie-registratie-component/)

## 1 Introduction

### 1.1 Document scope and purpose

This Rulebook defines the base attestation type for **permits** issued by Dutch public sector bodies (gemeenten, provincies, waterschappen, Rijk) to a User's Wallet Unit. A permit attestation is a PuB-EAA providing a verifiable, machine-readable representation of a granted permit, classified according to the Dutch Uniforme Productnamenlijst (UPL), and is presented by the Wallet Unit to Relying Parties. Specific permit types (e.g. standplaatsvergunning, evenementenvergunning) extend this base type.

### 1.2 Document structure

* Chapter 2, which describes the attestation attributes and metadata in an
encoding-independent manner.
* Chapter 3, which specifies the [SD-JWT VC] encoding of attributes and metadata.
Attestations of this type SHALL be encoded as [SD-JWT VC] only; [ISO/IEC 18013-5]
mdoc and [W3C VCDM v2.0] SHALL NOT be used.
* Chapter 4, which specifies attestation usage.
* Chapter 5, which defines how trust anchors for attestation verification can be obtained.
* Chapter 6, which defines attestation revocation mechanisms.
* Chapter 7, which provides compliance information.

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

## 2 Attestation attributes and metadata

### Chapter overview and requirements

This chapter defines, in an encoding-independent manner, all attributes and metadata that a permit attestation conforming to this Rulebook may contain (ARB_06). Each field is classified as mandatory, optional, or conditional in the corresponding subsection (ARB_09). Where applicable, identifiers reuse established Dutch public-sector vocabularies (notably the Uniforme Productnamenlijst) rather than introducing new terms (ARB_07).

Permit attestations defined by this Rulebook are PuB-EAAs. The requirements from [Topic 12] for PuB-EAAs map to fields specified in Sections 2.2 and 2.5 as follows:

* **ARB_11** — Annex VII point (a), indication that the attestation is a PuB-EAA: satisfied by the `attestation_legal_category` metadata field (Section 2.5), with fixed value `"PuB-EAA"`. See Section 2.1.
* **ARB_14** — Annex VII point (b), data unambiguously representing the issuing public body: satisfied by the `issuing_authority` and `issuing_country` metadata fields (Section 2.5).
* **ARB_16** — Annex VII point (c), data unambiguously representing the entity to which the attributes refer: satisfied via cryptographic binding to the User's PID rather than duplicate subject claims. The binding is advertised by the `cryptographically_bound_to` metadata field (Section 2.5) and enforced at issuance per Chapter 4.
* **ARB_18** — Annex VII point (e), validity period: satisfied by the `geldig_van` and `geldig_tot` attributes (Section 2.2), reflected at the SD-JWT VC level by the `nbf` and `exp` claims (Section 3.2).
* **ARB_20** — Annex VII point (h), location of the qualified certificate that signed the PuB-EAA: satisfied via the `x5c` JWS header of the SD-JWT VC together with the QTSP Trusted List trust anchor mechanism specified in Chapter 5.

### 2.1 Introduction

This Rulebook defines the base permit attestation type shared by every permit attestation issued under this scheme. Specific permit categories (e.g. street-trading, event, parking) are defined in sub-type Rulebooks that extend this base.

Within the base, the kind of permit is conveyed by claim *values*, not by the attribute set:

* `upl_naam` is the sole cross-authority semantic anchor, carrying the standardised name from the Dutch Uniforme Productnamenlijst (UPL).
* `product_naam` and `product_type_code` are local to the granting authority (typically a municipality) and SHALL NOT be relied upon for cross-authority semantics.

Sub-type Rulebooks MAY add type-specific attributes and metadata, but SHALL inherit, and SHALL NOT redefine or remove, any mandatory attribute or metadata field defined here.

According to Annex VII point (a) of the [European Digital Identity Regulation], an indication, at least in a form suitable for automated processing, that the attestation has been issued as a PuB-EAA must be defined. This Rulebook satisfies that requirement through the `attestation_legal_category` metadata field, which for permits is always `"PuB-EAA"`.

The set of data unambiguously representing the entity to which the attested attributes refer, as required by Annex VII point (c) of the [European Digital Identity Regulation], is not duplicated as subject attributes inside the permit. Instead, the permit attestation SHALL be cryptographically bound during issuance, in accordance with ACP_05 and ACP_07 of [Topic 18], to the User's PID (`vct = urn:eudi:pid:1`) on the same Wallet Unit. The identity of the natural person to whom the permit was granted is therefore conveyed by the bound PID at presentation time. This approach complies with the data-minimisation principle: a Relying Party only learns the User's PID attributes when those are explicitly requested. The metadata field `cryptographically_bound_to`, specified in [Section 2.5](#25-mandatory-metadata) below, advertises this binding to Relying Parties.

The indication of the scheme of attestations required by Annex VII point (f) of the [European Digital Identity Regulation] is conveyed by the `vct` claim defined in [Section 3.2](#32-sd-jwt-vc-based-encoding). The base `vct` for permits defined by this Rulebook is the URN `urn:eudi:nl:vng:permit:1`. Sub-type Rulebooks (e.g. for a specific permit type such as street trading) extend this base by appending a type segment before the version, for example `urn:eudi:nl:vng:permit:streettrading:1`.

Sections 2.2 - 2.7 list each attribute and metadata field with its data identifier, semantic definition, data type, and an example value. Identifiers are lowercase snake_case and machine-readable.

### 2.2 Mandatory attributes

| **Data Identifier** | **Definition**                                                                            | **Data type** | **Example value**                    |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------- | ------------------------------------ |
| upl_naam            | Standardized product name as defined in the Dutch Uniforme Productnamenlijst (UPL).       | string        | Standplaatsvergunning                |
| product_naam        | Human-readable name of the specific permit as issued by the granting authority.           | string        | Demo Standplaatsvergunning           |
| product_type_code   | Code identifying the product/permit type.                                                 | string        | test-vierdaagse                      |
| kenmerk             | Unique reference number assigned by the granting authority to identify the issued permit. | string        | 7f1aa4b5-3193-49d6-ba76-063e797f1e3f |
| geldig_van          | Start date of validity for this permit.                                                   | full-date     | 2026-01-01                           |
| geldig_tot          | End date of validity for this permit.                                                     | full-date     | 2027-01-01                           |

### 2.3 Optional attributes

Not specified.

### 2.4 Conditional attributes

Not specified.

### 2.5 Mandatory metadata

| **Data Identifier**        | **Definition**                                                                                                                                                                                                                                                                                                            | **Data type** | **Example value** |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------- |
| issuing_authority          | Name of the administrative authority that issued the permit.                                                                                                                                                                                                                                                              | string        | Gemeente Nijmegen |
| issuing_country            | Alpha-2 country code (ISO 3166-1) of the country of the issuing authority.                                                                                                                                                                                                                                                | string        | NL                |
| attestation_legal_category | Legal category under which the attestation is issued. For permits this value is always `"PuB-EAA"`.                                                                                                                                                                                                                       | string        | PuB-EAA           |
| cryptographically_bound_to | Indicates that during issuance the Attestation Provider obtained, according to ACP_05 of [Topic 18], proof that the private key of this attestation is managed by the same WSCA/WSCD as the private key of a PID on the same Wallet Unit. The value SHALL be the `vct` of the PID. See ARB_28 in [Topic 12] and Chapter 4. | string (vct)  | urn:eudi:pid:1    |

### 2.6 Optional metadata

Not specified.

### 2.7 Conditional metadata

Not specified.

# 3 Attestation encoding

## 3.1 ISO/IEC 18013-5-compliant encoding

Attestations of this type SHALL NOT be issued in the [ISO/IEC 18013-5] mdoc format. Proximity/offline presentation is not required (ARB_02); see Section 3.2 for the exclusive encoding.

### 3.2 SD-JWT VC-based encoding

*Attestations of this type SHALL be encoded as SD-JWT VC, complying with the 'SD-JWT VCs' profile specified in [HAIP] (see ARB_01b in [Topic 12]).*

#### Verifiable Credential Type (`vct`)

The Verifiable Credential Type for permits defined by this Rulebook is the URN:

```text
urn:eudi:nl:vng:permit:1
```

This URN is unique within the EUDI Wallet ecosystem (ARB_05) and serves as the indication of the scheme of attestations required by Annex VII point (f) of the [European Digital Identity Regulation]. It identifies the attestation type/scheme defined by Vereniging van Nederlandse Gemeenten (VNG) as Scheme Provider; it does not identify the Attestation Provider that issued any particular credential of this type. Every Attestation Provider issuing permits of this type SHALL include this exact URN in the `vct` claim, regardless of the Provider's internal catalog or hosting infrastructure.

The URN follows the structure `urn:eudi:<member-state>:<scheme-provider>:<type>:<version>`, identifying the attestation as part of the European Digital Identity Wallet ecosystem, scoped to the Netherlands (`nl`) and to VNG (`vng`) as Scheme Provider. This namespace does not overlap with the `urn:eudi:pid:` namespace reserved by PID_14 of the ARF.

Attestation Rulebooks for specific permit types SHALL extend this base by appending a type segment before the version, e.g.:

```text
urn:eudi:nl:vng:permit:streettrading:1
urn:eudi:nl:vng:permit:evenementen:1
urn:eudi:nl:vng:permit:standplaats:1
```

Sub-type Rulebooks SHALL inherit all mandatory attributes and metadata from this base Rulebook (`upl_naam`, `product_naam`, `product_type_code`, `kenmerk`, `geldig_van`, `geldig_tot`, `issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) and MAY define additional type-specific attributes, using the `extends` mechanism specified in Chapter 6 of [SD-JWT VC]. Sub-type Rulebooks MAY evolve their version segment independently of the base version.

The major version `:1` covers all backwards-compatible additions to the schema (new optional claims, new optional metadata, clarifications). The version SHALL be incremented when a previously-mandatory attribute is removed, a claim's encoding or semantics change, a claim's selective-disclosability designation changes, or the cryptographic binding model changes.

#### Type Metadata Document

Defining a Type Metadata Document as described in Chapter 6 of [SD-JWT VC] is OPTIONAL for this Rulebook (per ARB_31, which is a SHOULD-consider requirement). Attestation Providers MAY publish a Type Metadata Document for this `vct` at a URL of their choosing (for example, an internal catalog endpoint). Such documents are mirrors; the authoritative scheme definition is this Rulebook. If multiple Attestation Providers publish Type Metadata Documents for this `vct`, those documents SHALL describe a schema that is consistent with this Rulebook, and credentials MAY include a `vct#integrity` claim to enable verification of any retrieved Type Metadata Document.

#### Key binding (`cnf`)

The permit SD-JWT VC SHALL contain a `cnf` claim as specified in [SD-JWT VC], carrying the public key of the device-bound key pair generated by the Wallet Unit for this attestation. This key is used by the WSCA/WSCD to provide the cryptographic binding proof to the User's PID required by ACP_05 of [Topic 18]; see Chapter 4.

*Additionally, when specifying new attributes, existing conventions
for attribute identifier values and attribute syntaxes SHOULD
be considered (see ARB_07 in [Topic 12]).*

*Rulebook authors SHALL ensure that each claim name is either

* included in the IANA registry for JWT claims,
* is a Public Name as defined in [RFC 7519], or
* or is a Private Name specific to the attestation type. (see ARB_06b in [Topic 12]).*

*For all claims (i.e., all top-level properties, all nested properties, and all array entries),
the Rulebook SHALL specify whether an Attestation Provider MUST, MAY, or MUST NOT make that
claim selectively disclosable (see ARB_30 in [Topic 12]).*

*Rulebook authors SHOULD consider defining a Type Metadata Document for the attestation type
specified in the Rulebook, as defined in Chapter 6 of [SD-JWT VC]. If such a document is defined,
it SHOULD contain the Claim Selective Disclosure Metadata (defined in Section 9.3 of [SD-JWT VC])
for each of the claims, in order to specify if that claim is selectively disclosable (see ARB_31
in [Topic 12]).*

*IANA-registered claims should be presented in table that
includes their data identifier, attribute identifier,
encoding format, and reference or note. For example,*

| **Data Identifier** | **Attribute identifier** | **Encoding format** | **Reference/Notes**   | **Disclosable** |
| ------------------- | ------------------------ | ------------------- | --------------------- | --------------- |
| family_name         | family_name              | string              | Section 5.1 of [OIDC] | MUST            |

*A similar table should be used for Public Names and for Private Names specific
to the attestation type defined in this document. For
example:*

| **Data Identifier** | **Attribute identifier** | **Encoding format** | **Notes**                             | **Disclosable** |
| ------------------- | ------------------------ | ------------------- | ------------------------------------- | --------------- |
| trust_anchor        | trust_anchor             | string              | The trust anchor defined in Section 5 | MUST NOT        |

*The corresponding entry for the "attestation_legal_category" attribute defined
in Section 2.1 SHALL be:*

| **Data Identifier**        | **Attribute identifier**   | **Encoding format** | **Notes**                                                                           | **Disclosable** |
| -------------------------- | -------------------------- | ------------------- | ----------------------------------------------------------------------------------- | --------------- |
| attestation_legal_category | attestation_legal_category | string              | Defined in Attestation Rulebook template. Always `"PuB-EAA"` for permits.           | MUST NOT        |
| cryptographically_bound_to | cryptographically_bound_to | string              | Defined in [Section 2.5](#25-mandatory-metadata). Always `"urn:eudi:pid:1"`.        | MUST NOT        |

Finally, illustrative examples SHALL be included.

[RULEBOOK AUTHOR TO PROVIDE AN EXAMPLE OF THE JWT CLAIM SET USED BY THE PROVIDER]

[RULEBOOK AUTHOR TO PROVIDE AN EXAMPLE OF THE ISSUED SD-JWT (IN base64 ENCODING)]

[RULEBOOK AUTHOR TO PROVIDE AN EXAMPLE OF A HUMAN READABLE VERSION OF THE SD-JWT PAYLOAD
AND A DESCRIPTION OF THE DISCLOSURES INCLUDED IN THE EXAMPLE]

### 3.3 W3C Verifiable Credentials Data Model-based encoding

Attestations of this type SHALL NOT be issued in the [W3C VCDM v2.0] format; see Section 3.2 for the exclusive encoding.

## 4 Attestation usage

A permit attestation is presented online by a Wallet Unit to a Relying Party (for example a municipal service desk, an enforcement officer's mobile app, or an event organiser) that needs to verify whether the User holds a valid permit of a given type. Specific permit Rulebooks extending this base Rulebook describe the concrete use cases for their permit type.

**Device binding (ARB_34).** Permit attestations SHALL be device-bound. The SD-JWT VC SHALL contain a `cnf` claim carrying the public key of a key pair generated by the Wallet Unit's WSCA/WSCD; see Section 3.2.

**Cryptographic binding to the PID (ARB_28, Topic 18).** Permit attestations SHALL be cryptographically bound, during issuance, to the User's PID with `vct = "urn:eudi:pid:1"` on the same Wallet Unit:

1. Before issuing the permit, the Attestation Provider SHALL verify that the permit indeed belongs to the User identified by the PID (ACP_07 of [Topic 18]).
2. The Attestation Provider SHALL request and obtain, in accordance with ACP_05 of [Topic 18], a proof that the private key of the permit attestation is managed by the same WSCA/WSCD as the private key of the User's PID.
3. The Attestation Provider SHALL NOT issue the permit if this proof cannot be obtained.
4. The metadata field `cryptographically_bound_to` (see [Section 2.5](#25-mandatory-metadata)) SHALL be present in every permit and SHALL carry the value `"urn:eudi:pid:1"`.

**Relying Party obligations.** A Relying Party verifying a permit SHALL:

* Verify the qualified electronic signature or seal of the issuing PuB-EAA Provider over the SD-JWT VC, including the certificate chain up to the QTSP trust anchor (see Chapter 5).
* Verify the technical validity period of the SD-JWT VC (`nbf`, `exp`) and the administrative validity period (`geldig_van`, `geldig_tot`).
* Verify the key-binding signature created using the private key referenced by the `cnf` claim, as specified in [SD-JWT VC] / [HAIP].
* Check the revocation status of the permit (see Chapter 6).

Whenever the Relying Party needs to identify the natural person to whom the permit was granted (which is the case for most permit use cases, since permits are personal), the Relying Party SHALL also request the bound PID from the Wallet Unit and SHALL request a proof of cryptographic binding between the permit and the PID, as described in the note to ARB_28 in [Topic 12].

**Presentation.** Permit attestations are presented exclusively online, using the [HAIP] profile of OpenID4VP. Proximity/offline presentation using [ISO/IEC 18013-5] is not supported (see Section 3.1).

**Transactional data.** Permit attestations do not carry transactional data in the sense of [Topic 20] of Annex 2 of the ARF.

## 5 Trust anchors

*Mechanisms for the provision of a trust anchor that SHALL
be used for the verification of an attestation SHALL be defined in this section.*

The ARF specifies the following for PuB-EAAs:

> For PuB-EAAs, the Relying Party Instance verifies a PuB-EAA by first
verifying the signature of the PuB-EAA Provider over the PuB-EAA, using the
PuB-EAA Provider certificate issued by a QTSP. Subsequently, the Relying Party
Instance verifies the signature over this certificate, using the corresponding
trust anchor from the QTSP Trusted List. Note that both the PuB-EAA Provider
and the QTSP may use an intermediate signing certificate.

## 6 Revocation

(Refer to [Topic 7] of the ARF for a list of High-Level Requirements related to Revocation)

*In this section information about the revocation mechanism used SHALL be defined.*

For PuB-EAA it SHALL be defined whether only short-lived attestations will be used, having a validity period of 24 hours or less, such that revocation will never be necessary, or that the attestations are revocable.

*For revocable attestations it SHALL be defined which of the following methods must be implemented:*

* Use an Attestation Status List mechanism included in a Technical Specification
that will be specified by the Commission.
* Use an Attestation Revocation List mechanism included in a Technical Specification
that will be specified by the Commission.

## 7 Compliance

*In this section explicitly state how this specific rulebook complies with the
general EUDI framework, ARF, and relevant regulations*

[RULEBOOK AUTHOR TO DEFINE]

## 8 References

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