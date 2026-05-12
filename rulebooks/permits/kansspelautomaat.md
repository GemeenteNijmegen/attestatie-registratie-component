# Attestation Rulebook for attestations of type Permits — Presence Permit for Slot Machines (Kansspelautomaatvergunning)

| Field    | Value                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------|
| Status   | Draft                                                                                                                                 |
| Created  | 2026-05-12                                                                                                                            |
| Updated  | 2026-05-12                                                                                                                            |
| Extends  | [base.md](./base.md)                                                                                                                  |
| Authors  | *(to be assigned)*                                                                                                                    |
| Feedback | [github.com/GemeenteNijmegen/attestatie-registratie-component](https://github.com/GemeenteNijmegen/attestatie-registratie-component/) |

## Versions

| Version | Date       | Description                                                                                                                                                                                                                                                                                                                                        |
|---------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.0     | 2026-05-12 | First version. Extends Permits base Rulebook v1.0 for the kansspelautomaatvergunning (aanwezigheidsvergunning op grond van artikel 30b WoK). Adds establishment-bound attributes (`inrichting_adres`, `type_inrichting`, `max_aantal_automaten`), fixes the anchor credential to a KvK/LPID attestation, and adds a non-normative example payload. |

This Rulebook is an **extension** of the base Permits Attestation Rulebook defined in [base.md](./base.md). All chapters, sections, requirements, attributes, metadata, encoding rules, trust-anchor mechanisms, revocation mechanisms, compliance statements and references defined in [base.md](./base.md) apply unchanged unless explicitly overridden or extended below. Only the additions specific to the kansspelautomaatvergunning are defined here.


## 1 Introduction

### 1.1 Document scope and purpose

This Rulebook specialises [base.md](./base.md) for the **kansspelautomaatvergunning** — formally the *aanwezigheidsvergunning* as defined in artikel 30b, eerste lid, Wet op de kansspelen (WoK) — issued by Dutch municipalities (burgemeester). This permit authorises the holder to have one or more kansspelautomaten present in a specific named establishment. It is:

- **Premises-bound**: the permit names the establishment address and the maximum number of machines; these are mandatory attributes of every attestation of this type.
- **Operator-bound**: the permit is issued to the natural or legal person operating the establishment; it is non-transferable and cannot be assigned to another party. In practice almost all applicants are legal entities (BV, NV, VOF, eenmanszaak with KvK registration). Accordingly the default anchor credential under this Rulebook is a KvK registration attestation (or, once available, the EUDI LPID attestation).
- **Regulated nationally**: the permit co-exists with a separate *exploitatievergunning* issued by the Kansspelautoriteit under artikel 30h WoK; that credential is out of scope for this Rulebook.

Sections [1.2](./base.md#12-document-structure), [1.3](./base.md#13-key-words) and [1.4](./base.md#14-terminology) of [base.md](./base.md) apply unchanged.


## 2 Extension model

[Chapter 2](./base.md#2-extension-model) of [base.md](./base.md) applies with the following clarification on the anchor credential.

**Anchor credential.** Because the permit is issued to a KvK-registered operator (a natural or legal person operating as a business), the owner is recorded in the granting municipality's product registry by **KvK registration number**, not by BSN. Accordingly, at issuance, the Attestation Provider SHALL verify that the User's Wallet Unit holds a **KvK registration attestation** (or, once published, the EUDI LPID attestation) whose KvK number matches the operator recorded for the product in the product registry. `cryptographically_bound_to` SHALL be set to the `vct` of that KvK/LPID attestation (see [Section 3.5](#35-mandatory-metadata)). The default device-binding requirement from the base is retained.

**Natural-person sole traders.** Where the granting authority records the owner by BSN (e.g. an eenmanszaak without a KvK number in the product registry), the Attestation Provider SHALL fall back to PID-based disclosure per the base default, and SHALL set `cryptographically_bound_to` accordingly to `urn:eudi:pid:nl:1`. Sub-type implementations SHOULD document locally which identifier the product registry uses for sole traders.

No other override of the base issuance procedure is made by this Rulebook.


## 3 Attestation attributes and metadata

The chapter overview and requirements stated in [base.md §3](./base.md#3-attestation-attributes-and-metadata) apply unchanged: a kansspelautomaatvergunning attestation is a PuB-EAA.

### 3.1 Introduction

[base.md §3.1](./base.md#31-introduction) applies unchanged. Within the base classification, a kansspelautomaatvergunning is identified by:

- `upl_naam` SHALL be `"Kansspelautomaatvergunning"` — the cross-authority UPL anchor for this permit class. *(Fixed by this sub-type; see §3.2.)*
- `product_naam` and `product_type_code` — local to the granting municipality.
- `vct` = `urn:eudi:nl:vng:permit:kansspelautomaatvergunning:v1` (see [Section 4.2](#42-sd-jwt-vc-based-encoding)).

### 3.2 Mandatory attributes

In addition to the mandatory attributes defined in [base.md §3.2](./base.md#32-mandatory-attributes), the following attributes SHALL be included. The permit is always tied to a specific establishment at a specific address, and always specifies the maximum number of machines for which presence is authorised; these are essential for both enforcement and administrative verification.

| **Data Identifier**  | **Definition**                                                                                                        | **Data type** | **Example value**                |
|----------------------|-----------------------------------------------------------------------------------------------------------------------|---------------|----------------------------------|
| inrichting_adres     | Full postal address of the establishment for which the presence of kansspelautomaten is authorised.                   | string        | Molenstraat 12, 6511 JD Nijmegen |
| type_inrichting      | Classification of the establishment under WoK Titel Va: `hoogdrempelige inrichting` or `speelautomatenhal`.           | string        | Hoogdrempelige inrichting        |
| max_aantal_automaten | Maximum number of kansspelautomaten whose presence is authorised by this permit, as specified in the permit decision. | integer (≥ 1) | 2                                |

**Note on `type_inrichting`.** The WoK distinguishes exclusively between `hoogdrempelige inrichting` (artikel 30, onder d, WoK) and `speelautomatenhal` (artikel 30c, eerste lid, onder b, WoK) as the two establishment types for which an aanwezigheidsvergunning may be granted. The value SHALL be one of these two strings exactly. Granting authorities SHOULD use the Dutch-language terms as shown; implementations MAY include an English gloss in `product_naam` for Relying Party display, but `type_inrichting` is the normative field for automated checks.

**Note on `max_aantal_automaten`.** The WoK caps the number of kansspelautomaten per hoogdrempelige inrichting at two (artikel 30c, tweede lid, WoK) and grants municipalities discretion to set the cap for speelautomatenhallen by ordinance. The value in this field SHALL reflect the limit stated in the individual permit decision, which may be lower than the applicable statutory or ordinance cap.

### 3.3 Optional attributes

Not specified beyond [base.md §3.3](./base.md#33-optional-attributes).

### 3.4 Conditional attributes

Not specified beyond [base.md §3.4](./base.md#34-conditional-attributes).

### 3.5 Mandatory metadata

The mandatory metadata defined in [base.md §3.5](./base.md#35-mandatory-metadata) (`issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) apply unchanged. For kansspelautomaatvergunningen:

- `attestation_legal_category` SHALL be `"PuB-EAA"`.
- `cryptographically_bound_to` SHALL be the `vct` of the KvK registration attestation (or EUDI LPID attestation, once published) disclosed at issuance — for example `urn:eudi:nl:kvk:1` — or, where the owner is recorded by BSN, `urn:eudi:pid:nl:1`. See [Chapter 2](#2-extension-model) for the determination rule.

No additional metadata is defined by this Rulebook.

### 3.6 Optional metadata

Not specified beyond [base.md §3.6](./base.md#36-optional-metadata).

### 3.7 Conditional metadata

Not specified beyond [base.md §3.7](./base.md#37-conditional-metadata).


## 4 Attestation encoding

### 4.1 ISO/IEC 18013-5-compliant encoding

Not applicable; mdoc encoding SHALL NOT be used (see [base.md §4.1](./base.md#41-isoiec-18013-5-compliant-encoding)).

### 4.2 SD-JWT VC-based encoding

The encoding rules of [base.md §4.2](./base.md#42-sd-jwt-vc-based-encoding) apply unchanged. The following value is specific to this Rulebook:

- `vct` SHALL be `urn:eudi:nl:vng:permit:kansspelautomaatvergunning:v1`, formed by extending the base URN `urn:eudi:nl:vng:permit:v1` with the type segment `kansspelautomaatvergunning` before the version, as prescribed by [base.md §4.2](./base.md#42-sd-jwt-vc-based-encoding).

The kansspelautomaatvergunning-specific claims are encoded as follows:

| **Data Identifier**  | **Attribute identifier** | **Encoding format** | **Notes**                                                                              | **Selectively disclosable** |
|----------------------|--------------------------|---------------------|----------------------------------------------------------------------------------------|-----------------------------|
| inrichting_adres     | inrichting_adres         | string              | Defined in §3.2                                                                        | MUST                        |
| type_inrichting      | type_inrichting          | string              | Defined in §3.2. Value SHALL be `"Hoogdrempelige inrichting"` or `"Speelautomatenhal"` | MUST                        |
| max_aantal_automaten | max_aantal_automaten     | integer             | Defined in §3.2. Positive integer ≥ 1                                                  | MUST                        |

The encoding and disclosability of all inherited claims (`upl_naam`, `product_naam`, `product_type_code`, `kenmerk`, `geldig_van`, `geldig_tot`, `issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) are governed by [base.md §4.2](./base.md#42-sd-jwt-vc-based-encoding).

#### Example

The following non-normative example shows the payload of a kansspelautomaatvergunning attestation in SD-JWT VC format before encoding into the SD-JWT format. It illustrates the default binding pattern for a KvK-registered operator: the attestation is device-bound (`cnf` present) and cross-credential-bound to the operator's KvK registration attestation (`cryptographically_bound_to: "urn:eudi:nl:kvk:1"`).

```json
{
    "iss": "https://permits.nijmegen.nl",
    "iat": 1778495400,
    "nbf": 1767225600,
    "exp": 1798848000,
    "vct": "urn:eudi:nl:vng:permit:kansspelautomaatvergunning:v1",

    "upl_naam": "Kansspelautomaatvergunning",
    "product_naam": "Aanwezigheidsvergunning kansspelautomaten",
    "product_type_code": "kansspel-hoogdrempelig",
    "kenmerk": "a3f92c11-7d4b-4e10-b801-2f9a0d3c88e5",
    "geldig_van": "2026-01-01",
    "geldig_tot": "2027-01-01",

    "inrichting_adres": "Molenstraat 12, 6511 JD Nijmegen",
    "type_inrichting": "Hoogdrempelige inrichting",
    "max_aantal_automaten": 2,

    "issuing_authority": "Gemeente Nijmegen",
    "issuing_country": "NL",
    "attestation_legal_category": "PuB-EAA",
    "cryptographically_bound_to": "urn:eudi:nl:kvk:1",

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

**Note on `cnf`:** the public key shown is the same illustrative P-256 JWK used in the base Rulebook example; implementations SHALL generate a fresh key pair per attestation.

**Note on `exp`:** set to 00:00:00 UTC on 2027-01-02, so the attestation remains valid for the full calendar day of `geldig_tot` (2027-01-01) in UTC, per the base Rulebook grace-period rule. The default two-month grace period beyond `geldig_tot` applies unless overridden by a future version of this Rulebook.

### 4.3 W3C Verifiable Credentials Data Model-based encoding

Not applicable; W3C VCDM encoding SHALL NOT be used (see [base.md §4.3](./base.md#43-w3c-verifiable-credentials-data-model-based-encoding)).


## 5 Attestation usage

The attestation usage requirements of [base.md §5](./base.md#5-attestation-usage) apply unchanged, with the following additions.

### 5.1 Use cases and scenarios

Typical Relying Parties for this attestation type are:

- **Municipal enforcement officers (BOAs and toezichthouders)** verifying on-site, via an online verifier application, that kansspelautomaten are present within the limits and at the location stated on the permit (artikel 34 WoK);
- **Municipal back-office systems** cross-checking the permit status when processing renewal applications or Bibob integrity assessments;
- **The Kansspelautoriteit** verifying the existence of a valid municipal aanwezigheidsvergunning as a precondition for national enforcement actions.

Relying Parties in the enforcement context SHALL verify that the physical address of the inspected establishment matches `inrichting_adres` and that the number of machines present does not exceed `max_aantal_automaten`.

### 5.2 Presentation requirements

[base.md §5.2](./base.md#52-presentation-requirements) applies. In addition, a Relying Party requesting a kansspelautomaatvergunning attestation SHALL request the disclosure of the sub-type-specific claims `inrichting_adres`, `type_inrichting`, and `max_aantal_automaten` in addition to the full base claim set. These three claims are necessary for the enforcement verification decision.

Whenever the Relying Party needs to identify the legal entity or natural person holding the permit, it SHALL also request the bound KvK registration attestation (or PID, where applicable) and verify the cross-credential binding, as specified in [base.md §5.4](./base.md#54-cross-credential-cryptographic-binding).

### 5.3–5.7

[base.md §5.3](./base.md#53-device-binding) through [§5.7](./base.md#57-re-issuance) apply unchanged.


## 6 Trust anchors

See [base.md §6](./base.md#6-trust-anchors).


## 7 Revocation

See [base.md §7](./base.md#7-revocation). In addition: a kansspelautomaatvergunning SHALL be revoked in the product registry — and the corresponding attestation revoked — whenever the burgemeester withdraws the permit under artikel 30f WoK (e.g. upon serious public-order risk, repeated violation, or successful Bibob assessment). The Attestation Provider SHALL monitor the granting authority's product registry for revocation events and SHALL revoke the attestation without undue delay.


## 8 Compliance

See [base.md §8](./base.md#8-compliance). No additional compliance obligations arise from the WoK that are not already covered by the base Rulebook's compliance matrix. The co-existence of the national exploitatievergunning (artikel 30h WoK, issued by the Kansspelautoriteit) with the municipal aanwezigheidsvergunning (artikel 30b WoK, issued by the burgemeester) is an administrative matter outside the scope of this attestation scheme; the Relying Party is responsible for verifying both credentials independently where both are required.


## 9 References

See [base.md §9](./base.md#9-references). The following additional reference applies to this sub-type:

| **Item Reference**           | **Standard name/details**                                                                                                                                                                     |
|------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [WoK]                        | Wet op de kansspelen, BWBR0002469, in het bijzonder Titel Va (Speelautomaten), artikelen 30b t/m 30aa. Beschikbaar: [wetten.overheid.nl/BWBR0002469](https://wetten.overheid.nl/BWBR0002469/) |
| [Speelautomatenbesluit 2000] | Koninklijk Besluit van 23 mei 2000, Staatsblad 2000, 223, houdende regels ter uitvoering van Titel Va van de Wet op de kansspelen.                                                            |