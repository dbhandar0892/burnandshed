import { Link } from 'react-router-dom';

const Wrap = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <article className="max-w-2xl mx-auto px-6 py-10 space-y-4 text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_p]:text-sm [&_p]:text-muted-foreground [&_li]:text-sm [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-5">
      <Link to="/" className="text-sm text-primary">← Back to Burn & Shed</Link>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>Last updated: September 29, 2026</p>
      {children}
    </article>
  </div>
);

export const Privacy = () => (
  <Wrap title="Privacy Policy">
    <p>Burn & Shed is built to help you let go. We collect as little as possible.</p>
    <h2>What you write</h2>
    <p>Anything you type into Burn It, Shed It, Shred It or a ritual stays on your device and is never uploaded, stored or read by us.</p>
    <h2>Account information</h2>
    <p>If you sign in with Apple, we store your name and email (or Apple's private relay email) so your account and subscription work across devices.</p>
    <h2>On-device data</h2>
    <p>Activity counts, badges, theme and sound preferences are stored locally on your device.</p>
    <h2>Purchases</h2>
    <p>Subscriptions are handled by Apple. We never see your payment details.</p>
    <h2>Sharing</h2>
    <p>We do not sell your data or use it for advertising.</p>
    <h2>Deleting your data</h2>
    <p>You can delete your account anytime from the Profile page. This permanently removes your account information.</p>
    <h2>Contact</h2>
    <p>Questions about privacy: <a className="text-primary" href="mailto:privacy@burnandshed.com">privacy@burnandshed.com</a></p>
  </Wrap>
);

export const Terms = () => (
  <Wrap title="Terms of Use">
    <p>By using Burn & Shed you agree to these terms.</p>
    <h2>Not medical advice</h2>
    <p>Burn & Shed is a wellbeing tool, not a substitute for professional care. If you are in crisis, contact local emergency services or a crisis line.</p>
    <h2>Subscriptions</h2>
    <ul>
      <li>Premium is $3.99/month or $29.99/year after a 7-day free trial.</li>
      <li>Payment is charged to your Apple ID at confirmation of purchase.</li>
      <li>Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period.</li>
      <li>Manage or cancel anytime in your Apple ID account settings.</li>
    </ul>
    <p>Apple's standard Licensed Application End User License Agreement also applies.</p>
    <h2>Contact</h2>
    <p><a className="text-primary" href="mailto:support@burnandshed.com">support@burnandshed.com</a></p>
  </Wrap>
);
