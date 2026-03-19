import express from 'express';
import { AttestatieRegestratieComponent } from '../src/AttestationRegistrationComponent';
import { VerIdAttestationService } from '../src/attestation-service/VerIdAttestationService';
import { ProductenService } from '../src/producten/ProductenService';

const app = express();
app.use(express.json());

const component = new AttestatieRegestratieComponent({
  attestationService: new VerIdAttestationService({
    issuerUri: process.env.VERID_ISSUER_URI!,
    redirectUri: process.env.VERID_REDIRECT_URI!,
    client_id: process.env.VERID_CLIENT_ID!,
    client_secret: process.env.VERID_CLIENT_SECRET!,
  }),
  productenService: new ProductenService(),
});

app.post('/start', async (req, res) => {
  try {
    const url = await component.start(req.body);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/callback', async (req, res) => {
  try {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const success = await component.callback(params);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
