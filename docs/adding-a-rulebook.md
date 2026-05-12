# Een rulebook schrijven

Een Attestation Rulebook definieert één type rechtsgeldige attestatie binnen het ARC-scheme. Deze handleiding beschrijft wat erin moet, hoe je begint, en waar de eisen vandaan komen.

## Wanneer een rulebook?

Een nieuwe rulebook is nodig zodra je een type attestatie wilt uitgeven dat nog niet in [rulebooks/](../rulebooks/) staat. Wil je een variant van een bestaand type — bijvoorbeeld een specifieke vergunningsvorm — kies dan voor een **sub-type rulebook** dat een bestaande base extendt. Voor permits is dat [rulebooks/permits/base.md](../rulebooks/permits/base.md); de twee bestaande sub-types ([streettrading.md](../rulebooks/permits/streettrading.md) en [kansspelautomaat.md](../rulebooks/permits/kansspelautomaat.md)) laten zien hoe dat eruitziet.

Wil je een geheel nieuw soort attestatie (geen vergunning, geen identiteit), start dan met [rulebooks/template/base-template.md](../rulebooks/template/base-template.md) als blanco template.

## Bronnen

Een rulebook is een implementatie-document voor eisen die elders bindend zijn. De twee gezaghebbende bronnen zijn:

- **Annex VII van de [eIDAS 2.0-verordening (EU) 2024/1183](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401183)** — somt op wat een PuB-EAA juridisch moet bevatten (punten a t/m i).
- **Topic 12 van het [EUDI Architecture and Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework)** — de technische vertaling daarvan in 34 high-level requirements (ARB_01 t/m ARB_34). Zie [annex 2 van het ARF](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md).

Daarnaast gebruikt het ARC-scheme:

- **[SD-JWT VC](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)** als enige attestation-formaat;
- **[HAIP — OpenID4VC High Assurance Interoperability Profile](https://openid.github.io/oid4vc-haip-sd-jwt-vc/draft-oid4vc-haip-sd-jwt-vc.html)** als interoperabiliteitsprofiel;
- **[OpenID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)** als presentatieprotocol;
- **de [Uniforme Productnamenlijst (UPL)](https://standaarden.overheid.nl/owms/terms/UniformeProductnaam)** als semantisch anker voor producten (waar van toepassing).

## Structuur

Elke rulebook volgt dezelfde hoofdstukindeling. Houd deze aan, ook als sommige secties leeg blijven (markeer dan als *Not specified*).

| #   | Hoofdstuk                           | Doel                                                                                                                                                                                                                                                         |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Introduction                        | Scope, audience, terminologie, keywords.                                                                                                                                                                                                                     |
| 2   | Extension model                     | Voor een base-rulebook: hoe sub-types extenden. Voor een sub-type: de issuance-procedure en binding-defaults die overgenomen of overruled worden.                                                                                                            |
| 3   | Attestation attributes and metadata | Encoding-onafhankelijke definitie van alle velden, gesplitst in mandatory / optional / conditional.                                                                                                                                                          |
| 4   | Attestation encoding                | SD-JWT VC encoding, `vct`-URN, claim-naming, selective disclosure, key binding (`cnf`), envelope claims.                                                                                                                                                     |
| 5   | Attestation usage                   | Hoe Relying Parties de attestatie presenteren en verifiëren.                                                                                                                                                                                                 |
| 6   | Trust anchors                       | QTSP-certificaat, LOTL-trust anchor.                                                                                                                                                                                                                         |
| 7   | Revocation                          | Attestation Status List of Attestation Revocation List per [Topic 7 van het ARF](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-2/annex-2.02-high-level-requirements-by-topic.md). |
| 8   | Compliance                          | Twee cross-walks: Annex VII (punten a t/m i) en ARB_01 t/m ARB_34.                                                                                                                                                                                           |
| 9   | References                          | Genormeerde verwijzingen.                                                                                                                                                                                                                                    |

## De compliance-matrix

Hoofdstuk 8 is geen formaliteit. Voor elk Annex VII-punt en elke ARB-regel moet de rulebook óf aanwijzen waar in de rulebook eraan wordt voldaan, óf gemotiveerd uitleggen waarom de regel niet van toepassing is. Een rulebook met onafgesloten cijfers in deze matrix hoort niet thuis in het scheme.

Bekijk de matrix in [rulebooks/permits/base.md](../rulebooks/permits/base.md) (Hoofdstuk 8) als referentie-implementatie.

## Verplichte velden (PuB-EAA)

Annex VII van de verordening vereist dat elk PuB-EAA in elk geval het volgende vastlegt:

- de indicatie dat de attestatie een PuB-EAA is (`attestation_legal_category: "PuB-EAA"`);
- data die de uitgevende instantie identificeren (naam, lidstaat);
- data die de attestatie-houder identificeren — in dit scheme bij voorkeur via `cryptographically_bound_to` aan een anker-credential (PID voor natuurlijke personen op BSN, KvK-attestatie voor rechtspersonen);
- de attestatie-attributen zelf;
- een geldigheidsperiode;
- een attestation identifier en het scheme van de attestatie (`kenmerk` + `vct`);
- een gekwalificeerd elektronisch zegel van de uitgevende instantie;
- de locatie van het gekwalificeerd certificaat (in `x5c` + LOTL);
- informatie waarmee de geldigheid kan worden gecontroleerd (revocation).

## `vct`-URN-naamgeving

URN's binnen het ARC-scheme volgen het patroon:

```
urn:eudi:nl:<scheme-provider>:<type>[:<sub-type>]:v<major>
```

Voorbeelden:

```
urn:eudi:nl:vng:permit:v1
urn:eudi:nl:vng:permit:streettrading:v1
urn:eudi:pid:nl:1
```

De major-versie wordt verhoogd zodra de wijziging een eerder conform credential zou kunnen breken — niet voor backwards-compatibele uitbreidingen.

## Reviewproces

Een nieuwe of gewijzigde rulebook wordt in dezelfde PR aangeboden als de bijbehorende code-implementatie (zie [adding-an-attestation.md](adding-an-attestation.md)). Reviewers controleren ten minste:

1. Hoofdstukindeling compleet (1 t/m 9).
2. Compliance-matrix volledig en consistent met de rulebook-tekst.
3. `vct`-URN volgt het naamgevingspatroon en botst niet met een bestaand `vct`.
4. Issuance-procedure expliciet beschreven (default of override met motivatie).
5. Selective-disclosure-policy per claim expliciet (MUST / MAY / MUST NOT).
6. Trust anchors en revocation-mechanisme gespecificeerd.
7. Code-implementatie volgt 1-op-1 de claims uit de rulebook.

## Verder lezen

- [PID-rulebook van de Commissie](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/blob/main/rulebooks/pid/pid-rulebook.md) — referentie-rulebook voor de Europese PID.
- [mDL-rulebook van de Commissie](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/blob/main/rulebooks/mdl/mdl-rulebook.md) — referentie-rulebook voor de mobiele rijbewijsattestatie.
- [Catalogue of Attestation Rulebooks](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog) — de EU-brede catalogus.
