import { FormEvent, useState } from 'react';
import { ArrowLeft, BookOpen, LoaderCircle, LockKeyhole, Mail, UserRound, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type Props = { onClose: () => void; onSignedIn: (name: string) => void };

export default function AuthModal({ onClose, onSignedIn }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Côte d’Ivoire');
  const [field, setField] = useState('');
  const [customField, setCustomField] = useState('');
  const [level, setLevel] = useState('');
  const [institution, setInstitution] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    if (!isSupabaseConfigured || !supabase) { setError('L’authentification n’est pas encore configurée. Le propriétaire doit connecter un projet Supabase et renseigner les variables d’environnement.'); return; }
    setBusy(true);
    try {
      if (mode === 'reset') {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (e) throw e;
        setMessage('Si cette adresse est associée à un compte, un lien de réinitialisation va être envoyé.');
      } else if (mode === 'signup') {
        const { data, error: e } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, country, institution: institution || null, study_field: field === 'Autre' ? customField : field, study_level: level } } });
        if (e) throw e;
        if (data.session) { onSignedIn(fullName); onClose(); }
        else setMessage('Inscription envoyée. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.');
      } else {
        const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        onSignedIn(data.user.user_metadata?.full_name || data.user.email || 'Étudiant'); onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessaie.');
    } finally { setBusy(false); }
  }

  const title = mode === 'signup' ? 'Crée ton compte' : mode === 'reset' ? 'Réinitialiser le mot de passe' : 'Ravi de te revoir';
  return <div className="auth-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="auth-close" aria-label="Fermer" onClick={onClose}><X size={20} /></button>
      <div className="auth-brand"><span className="brand-mark"><BookOpen size={22} /></span><span>Révise<span className="brand-ci">CI</span></span></div>
      <span className="eyebrow">TON ESPACE D’ÉTUDE</span><h2 id="auth-title">{title}</h2><p className="auth-intro">{mode === 'signup' ? 'Quelques informations pour personnaliser ton espace étudiant.' : mode === 'reset' ? 'Saisis ton adresse e-mail pour recevoir les instructions.' : 'Connecte-toi pour retrouver tes cours et tes révisions.'}</p>
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <><label>Nom complet<input required autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ton nom et tes prénoms" /></label><label>Pays<select value={country} onChange={e => setCountry(e.target.value)}><option>Côte d’Ivoire</option><option>Burkina Faso</option><option>Bénin</option><option>Mali</option><option>Sénégal</option><option>Togo</option><option>Autre</option></select></label><label>Filière<select required value={field} onChange={e => setField(e.target.value)}><option value="">Choisir une filière</option>{['Pharmacie','Médecine','Sciences biologiques','Chimie','Droit','Économie et gestion','Informatique','Autre'].map(x => <option key={x}>{x}</option>)}</select></label>{field === 'Autre' && <label>Précise ta filière<input required value={customField} onChange={e => setCustomField(e.target.value)} placeholder="Ta filière" /></label>}<label>Niveau d’études<select required value={level} onChange={e => setLevel(e.target.value)}><option value="">Choisir ton niveau</option>{['Lycée','Licence 1','Licence 2','Licence 3','Master 1','Master 2','Doctorat','Autre'].map(x => <option key={x}>{x}</option>)}</select></label><label>Établissement <span className="optional">(facultatif)</span><input value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Université ou école" /></label></>}
        <label>Adresse e-mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="toi@exemple.com" /></label>
        {mode !== 'reset' && <label>Mot de passe<input required type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="8 caractères minimum" /></label>}
        {error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-message" role="status">{message}</p>}
        <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={16} />}{busy ? 'Patiente…' : mode === 'signup' ? 'Créer mon compte' : mode === 'reset' ? 'Envoyer le lien' : 'Se connecter'}</button>
      </form>
      <div className="auth-switch">{mode === 'signin' ? <><button onClick={() => setMode('reset')}>Mot de passe oublié ?</button><p>Pas encore de compte ? <button onClick={() => setMode('signup')}>Créer un compte</button></p></> : <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }}><ArrowLeft size={14} /> Retour à la connexion</button>}</div>
      {!isSupabaseConfigured && <p className="auth-config-note">Mode de configuration : les comptes ne seront créés qu’après connexion de Supabase.</p>}
    </section>
  </div>;
}
