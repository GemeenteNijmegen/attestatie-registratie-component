# Rechtsgeldigheid

Onder welke voorwaarden heeft een EUDI-wallet credential rechtsgevolgen onder eIDAS 2.0? Dit document beschrijft het juridisch-technische stelsel waarop de rechtskracht van een PuB-EAA berust en de twee processen waarmee die rechtskracht in de praktijk wordt gedragen.

## Juridische basis

Onder artikel 45f van de [eIDAS 2.0-verordening (EU) 2024/1183](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202401183) heeft een PuB-EAA dezelfde rechtsgevolgen als een papieren attestatie. Die status berust op een samenhangend stelsel dat het [EUDI Architecture and Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) (ARF) technisch uitwerkt.

## De vier pijlers

- **Authentieke bron** (ARF §3.10): een bij wet erkende publieke of private registratie voor gegevens over natuurlijke of rechtspersonen, zoals de BRP, het KvK-handelsregister, het kentekenregister, het kadaster of een gemeentelijke productregistratie. De attestatie is een elektronische representatie van een gegeven uit zo'n bron; zonder authentieke bron is er geen PuB-EAA.
- **Attestation Provider** (ARF §3.7): een publiekrechtelijke instantie die verantwoordelijk is voor de authentieke bron, of een instantie die op haar gezag namens haar uitgeeft. De Provider hoeft zelf geen QTSP te zijn, maar ondertekent met een door een QTSP afgegeven gekwalificeerd certificaat. Providers worden bij een nationale Registrar geregistreerd (§3.17) en staan onder toezicht van Supervisory Bodies (§3.13).
- **Compliance- en trust-framework**: Annex VII van de verordening somt de verplichte data-elementen (a) tot en met (i) op; Topic 12 van het ARF (ARB_01 t/m ARB_34) werkt deze technisch uit. Het vertrouwen wordt verankerd via de [List of Trusted Lists](https://digital-strategy.ec.europa.eu/en/policies/eu-trusted-lists) (LOTL): per lidstaat publiceren Trusted List-providers de geaccrediteerde QTSP-trust anchors, Wallet Provider-LoTEs en Attestation Provider-registraties. Conformity Assessment Bodies (§3.12) certificeren wallets; Supervisory Bodies houden toezicht.
- **Rulebook**: legt voor één attestatietype vast welk formaat (SD-JWT VC), `vct`, claims, trust anchors, revocation-mechanisme en presentatieprotocol gelden, met een sluitende compliance-matrix tegen Annex VII en Topic 12. Een attestatie die hier niet aan voldoet, kwalificeert niet als PuB-EAA en mist de rechtsgevolgen die artikel 45f eraan toekent.

## De twee processen

Twee processen dragen het kader in de praktijk:

- **Uitgifte** (ARF §6.6.2). Een keten van vertrouwensrelaties tussen Wallet Unit, Attestation Provider en Wallet Provider: de Wallet authenticeert de Provider via een access-certificaat uit de Trusted List; de Provider authenticeert de Gebruiker op een passend Level of Assurance; de Provider valideert de Wallet Unit aan de hand van Wallet Instance en Wallet Unit Attestations getekend door een vertrouwde Wallet Provider; en verifieert dat de Wallet Unit niet is ingetrokken. Hoe de binding aan de rechthebbende uit de authentieke bron tot stand komt, wordt per attestatietype in de rulebook gespecificeerd. De Provider bezegelt de attestatie met het gekwalificeerd zegel.
- **Verificatie** (ARF §6.6.3). Verplicht is de verificatie van het gekwalificeerd zegel via een trust anchor uit de QTSP Trusted List, inclusief de certificate-chain. Aanvullend controleert de Relying Party, in lijn met de rulebook en de gebruikssituatie, de revocation-status, de device binding (`cnf` bij SD-JWT VC), een eventuele cross-credential binding aan een anker-credential, de administratieve geldigheidsperiode en de User binding.

## Per attestatietype

De volledige procedures per attestatietype staan in Hoofdstuk 2 (uitgifte) en Hoofdstuk 5 (verificatie) van de betreffende rulebook. Voor het schrijven van een nieuwe rulebook, inclusief de compliance-matrix tegen Annex VII en ARB_01 t/m ARB_34, zie [adding-a-rulebook.md](adding-a-rulebook.md).
