
# Attestation Rulebook for attestations of type Permits — Street Trading (Standplaatsvergunning)

| Field    | Value                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------|
| Status   | Draft                                                                                                                                 |
| Created  | 2026-05-11                                                                                                                            |
| Updated  | 2026-05-12                                                                                                                            |
| Extends  | [base.md](./base.md)                                                                                                                  |
| Authors  | Marnix Dessing (Gemeente Nijmegen), Sten Reijers (Ver.iD)                                                                             |
| Feedback | [github.com/GemeenteNijmegen/attestatie-registratie-component](https://github.com/GemeenteNijmegen/attestatie-registratie-component/) |

## Versions

| Version | Date       | Description                                                                                                                                                                                                                                                                                       |
|---------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1.0     | 2026-05-11 | First version. Extends Permits base Rulebook v1.0 with location-bound attributes (`locatie`, `type_locatie`) and the `vct` `urn:eudi:nl:vng:permit:streettrading:v1`.                                                                                                                             |
| 1.1     | 2026-05-12 | Corrected `vct` version suffix to `:v1`; corrected `cryptographically_bound_to` fixed value to `urn:eudi:pid:nl:1`; aligned section numbering with base; added normative `upl_naam` constraint; extended presentation requirements to cover sub-type claims; added non-normative example payload. |

This Rulebook is an **extension** of the base Permits Attestation Rulebook defined in [base.md](./base.md). All chapters, sections, requirements, attributes, metadata, encoding rules, trust-anchor mechanisms, revocation mechanisms, compliance statements and references defined in [base.md](./base.md) apply unchanged unless explicitly overridden or extended below. Only the additions specific to street-trading permits (NL: *standplaatsvergunning*) are defined here.


## 1 Introduction

### 1.1 Document scope and purpose

This Rulebook specializes [base.md](./base.md) for **street-trading permits** (*standplaatsvergunning*) issued by Dutch municipalities. A street-trading permit authorises the holder to operate a market stall or comparable commercial activity at a specific public location and is therefore inherently location-bound; the location is conveyed by the mandatory `locatie` and `type_locatie` attributes added in [Section 3.2](#32-mandatory-attributes).

Sections [1.2](./base.md#12-document-structure), [1.3](./base.md#13-key-words) and [1.4](./base.md#14-terminology) of [base.md](./base.md) apply unchanged.


## 2 Extension model

[Chapter 2](./base.md#2-extension-model) of [base.md](./base.md) applies unchanged. This Rulebook does not override the default issuance procedure: street-trading permits are issued via disclosure-based issuance against the granting municipality's product registry, and the permit is cryptographically bound to the User's PID. The default device-binding requirement is retained.


## 3 Attestation attributes and metadata

The chapter overview and requirements stated in [base.md §3](./base.md#3-attestation-attributes-and-metadata) apply unchanged: a street-trading permit attestation is a PuB-EAA.

### 3.1 Introduction

[base.md §3.1](./base.md#31-introduction) applies unchanged. Within the base classification, a street-trading permit is identified by:

- `upl_naam` SHALL be `"Standplaatsvergunning"` — the cross-authority UPL anchor for this permit class. *(Fixed by this sub-type; see §3.2 below.)*
- `product_naam` and `product_type_code` — local to the granting municipality.
- `vct` = `urn:eudi:nl:vng:permit:streettrading:v1` (see [Section 4.2](#42-sd-jwt-vc-based-encoding)).


### 3.2 Mandatory attributes

In addition to the mandatory attributes defined in [base.md §3.2](./base.md#32-mandatory-attributes), the following attributes SHALL be included, because street-trading permits are always tied to a specific physical location:

| **Data Identifier** | **Definition**                                                                                         | **Data type** | **Example value**    |
|---------------------|--------------------------------------------------------------------------------------------------------|---------------|----------------------|
| locatie             | Address or designation of the physical location to which the permit applies.                           | string        | Plein 1944, Nijmegen |
| type_locatie        | Classification of the location (e.g., `vaste standplaats`, `mobiele standplaats`, `binnen`, `buiten`). | string        | Vaste standplaats    |

### 3.3 Optional attributes

Not specified beyond [base.md §3.3](./base.md#33-optional-attributes).

### 3.4 Conditional attributes

Not specified beyond [base.md §3.4](./base.md#34-conditional-attributes).

### 3.5 Mandatory metadata

The mandatory metadata defined in [base.md §3.5](./base.md#35-mandatory-metadata) (`issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) apply unchanged. For street-trading permits:

- `attestation_legal_category` SHALL be `"PuB-EAA"`.
- `cryptographically_bound_to` SHALL be `"urn:eudi:pid:nl:1"`.


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

- `vct` SHALL be `urn:eudi:nl:vng:permit:streettrading:v1`, formed by extending the base URN `urn:eudi:nl:vng:permit:v1` with the type segment `streettrading` before the version, as prescribed by [base.md §4.2](./base.md#42-sd-jwt-vc-based-encoding).

The street-trading-specific claims are encoded as follows:

| **Data Identifier** | **Attribute identifier** | **Encoding format** | **Notes**       | **Selectively disclosable** |
|---------------------|--------------------------|---------------------|-----------------|-----------------------------|
| locatie             | locatie                  | string              | Defined in §3.2 | MUST                        |
| type_locatie        | type_locatie             | string              | Defined in §3.2 | MUST                        |

The encoding and disclosability of all inherited claims (`upl_naam`, `product_naam`, `product_type_code`, `kenmerk`, `geldig_van`, `geldig_tot`, `issuing_authority`, `issuing_country`, `attestation_legal_category`, `cryptographically_bound_to`) are governed by [base.md §4.2](./base.md#42-sd-jwt-vc-based-encoding).

#### Example

The following non-normative example shows the payload of a street-trading permit attestation in SD-JWT VC format before encoding into the SD-JWT format. It illustrates the default binding pattern: the attestation is device-bound (`cnf` present) and cross-credential-bound to the User's PID (`cryptographically_bound_to: "urn:eudi:pid:nl:1"`).

```json
{
    "iss": "https://permits.nijmegen.nl",
    "iat": 1778495400,
    "nbf": 1767225600,
    "exp": 1798848000,
    "vct": "urn:eudi:nl:vng:permit:streettrading:v1",

    "upl_naam": "Standplaatsvergunning",
    "product_naam": "Standplaatsvergunning langs de 4D-route",
    "product_type_code": "standaplaats-4D",
    "kenmerk": "7f1aa4b5-3193-49d6-ba76-063e797f1e3f",
    "geldig_van": "2026-01-01",
    "geldig_tot": "2027-01-01",

    "locatie": "Plein 1944, Nijmegen",
    "type_locatie": "Foodtruck",

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

### 4.3 W3C Verifiable Credentials Data Model-based encoding

Not applicable; W3C VCDM encoding SHALL NOT be used (see [base.md §4.3](./base.md#43-w3c-verifiable-credentials-data-model-based-encoding)).


## 5 Attestation usage

The attestation usage requirements of [base.md §5](./base.md#5-attestation-usage) apply unchanged, with the following additions.

### 5.1 Use cases and scenarios

Typical Relying Parties for this attestation type are municipal enforcement officers (BOAs) verifying a stall holder's authorisation on site through an online verifier application, and market masters verifying assignment of pitches.

### 5.2 Presentation requirements

[base.md §5.2](./base.md#52-presentation-requirements) applies. In addition, a Relying Party requesting a street-trading permit attestation SHALL request the disclosure of the sub-type-specific claims `locatie` and `type_locatie` in addition to the full base claim set. These claims are necessary to verify that the permit applies to the specific location being inspected.

Whenever the Relying Party needs to identify the natural person holding the permit, it SHALL also request the bound PID and verify the cross-credential binding, as specified in [base.md §5.4](./base.md#54-cross-credential-cryptographic-binding).


### 5.3–5.7

[base.md §5.3](./base.md#53-device-binding) through [§5.7](./base.md#57-re-issuance) apply unchanged.


## 6 Trust anchors

See [base.md §6](./base.md#6-trust-anchors).


## 7 Revocation

See [base.md §7](./base.md#7-revocation).


## 8 Compliance

See [base.md §8](./base.md#8-compliance).


## 9 References

See [base.md §9](./base.md#9-references).