import { useEffect, useRef, useState } from 'react';
import AuthModal from './AuthModal';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { BookOpen, Brain, CheckCircle2, ChevronRight, CircleHelp, Clock3, FileText, GraduationCap, LockKeyhole, Menu, Plus, ShieldCheck, Sparkles, Target, UploadCloud, X } from 'lucide-react';

type CourseFile = { name: string; size: number; status: 'local' };

const features = [
  { icon: FileText, title: 'Résumés fidèles', text: 'Retrouve les idées essentielles de ton document sans perdre le fil du cours.' },
  { icon: Brain, title: 'Fiches de mémorisation', text: 'Transforme les notions importantes en questions et réponses pour t’entraîner.' },
  { icon: Target, title: 'QCM et entraînement', text: 'Teste ta compréhension et identifie les notions à revoir.' },
];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [signedInName, setSignedInName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<CourseFile | null>(null);
  const [notice, setNotice] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSignedInName(data.session.user.user_metadata?.full_name || data.session.user.email || 'Étudiant');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedInName(session?.user.user_metadata?.full_name || session?.user.email || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setSignedInName(null);
    setNotice('Tu es déconnecté.');
  }

  function handleFile(file?: File) {
    setNotice('');
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setSelectedFile(null);
      setNotice('Choisis un document au format PDF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setSelectedFile(null);
      setNotice('Le fichier dépasse la limite actuelle de 20 Mo.');
      return;
    }
    setSelectedFile({ name: file.name, size: file.size, status: 'local' });
    setNotice('Document sélectionné sur cet appareil. L’envoi sécurisé sera activé après configuration du stockage.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#accueil" aria-label="RéviseCI, accueil">
          <span className="brand-mark"><BookOpen size={22} strokeWidth={2.5} /></span>
          <span>Révise<span className="brand-ci">CI</span><small>APPRENDS. RÉVISE. RÉUSSIS.</small></span>
        </a>
        <button className="mobile-menu" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#fonctionnalites" onClick={() => setMenuOpen(false)}>Fonctionnalités</a>
          <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
          <a href="#securite" onClick={() => setMenuOpen(false)}>Sécurité</a>
          {signedInName ? <><span className="nav-greeting">Bonjour, {signedInName.split(' ')[0]}</span><button className="button button-outline" onClick={signOut}>Déconnexion</button></> : <><button className="button button-outline" onClick={() => setAuthOpen(true)}>Connexion</button><button className="button button-primary" onClick={() => setAuthOpen(true)}>Créer un compte <ChevronRight size={17} /></button></>}
        </nav>
      </header>

      <main id="accueil">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15} /> LA RÉVISION, AUTREMENT</div>
            <h1>Ton cours devient plus facile à <span>comprendre, mémoriser et maîtriser.</span></h1>
            <p className="hero-description">Importe tes cours et prépare-toi plus efficacement grâce à des outils de révision conçus pour les étudiants francophones.</p>
            <div className="hero-actions">
              <button className="button button-primary button-large" onClick={() => signedInName ? document.getElementById('importer')?.scrollIntoView({ behavior: 'smooth' }) : setAuthOpen(true)}>{signedInName ? 'Importer mon premier cours' : 'Créer mon espace étudiant'} <ChevronRight size={18} /></button>
              <a className="text-link" href="#fonctionnalites">Découvrir les fonctionnalités</a>
            </div>
            <div className="trust-line"><ShieldCheck size={17} /> Tes cours restent privés lorsque le stockage sécurisé est configuré.</div>
          </div>
          <div className="hero-visual" aria-label="Aperçu illustratif de l’espace de révision">
            <div className="visual-orbit orbit-one"></div><div className="visual-orbit orbit-two"></div>
            <div className="study-card">
              <div className="study-card-head"><span className="mini-logo"><GraduationCap size={19} /></span><span><strong>Mon espace de révision</strong><small>Aperçu de l’interface</small></span><span className="online-dot" /></div>
              <div className="study-welcome"><span>PRÊT À APPRENDRE ?</span><h3>Un pas à la fois.</h3><p>Organise tes cours et révise à ton rythme.</p></div>
              <div className="study-stats"><div><span className="stat-icon blue"><FileText size={17} /></span><span><strong>Mes cours</strong><small>Importe un PDF</small></span></div><div><span className="stat-icon yellow"><Brain size={17} /></span><span><strong>Mes révisions</strong><small>Entraîne ta mémoire</small></span></div></div>
              <div className="study-bottom"><span><Clock3 size={15} /> Ton prochain objectif</span><span className="pill">À définir</span></div>
            </div>
            <div className="float-badge float-top"><span className="float-icon"><CheckCircle2 size={19} /></span><span><strong>Apprends activement</strong><small>Comprends à ton rythme</small></span></div>
            <div className="float-badge float-bottom"><span className="float-icon violet"><Brain size={19} /></span><span><strong>Retiens l’essentiel</strong><small>Des révisions plus ciblées</small></span></div>
          </div>
        </section>

        <section className="steps-section" id="comment-ca-marche"><div className="wrap"><div className="section-heading"><span className="eyebrow">SIMPLE ET PRATIQUE</span><h2>De ton cours à ta séance de révision</h2><p>Une méthode claire pour travailler avec plus de structure.</p></div><div className="steps-grid"><div className="step"><span className="step-number">01</span><span className="step-icon"><UploadCloud /></span><h3>Importe ton cours</h3><p>Commence avec un document PDF de ton appareil.</p></div><div className="step"><span className="step-number">02</span><span className="step-icon"><FileText /></span><h3>Prépare le contenu</h3><p>Le texte sera extrait pour préparer tes outils de révision.</p></div><div className="step"><span className="step-number">03</span><span className="step-icon"><Brain /></span><h3>Entraîne-toi</h3><p>Travaille les résumés, fiches et questions disponibles.</p></div><div className="step"><span className="step-number">04</span><span className="step-icon"><Target /></span><h3>Suis tes progrès</h3><p>Les résultats seront enregistrés lorsque ton compte sera configuré.</p></div></div></div></section>

        <section className="features-section wrap" id="fonctionnalites"><div className="section-heading"><span className="eyebrow">CONÇU POUR TES ÉTUDES</span><h2>Les bons outils pour mieux réviser</h2><p>Le MVP sera construit progressivement, en donnant la priorité aux fonctions vraiment utiles.</p></div><div className="features-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={23} /></span><h3>{title}</h3><p>{text}</p><span className="feature-status">Prévu dans le MVP</span></article>)}</div></section>

        <section className="upload-section" id="importer"><div className="wrap upload-layout"><div className="upload-copy"><span className="eyebrow">TON PREMIER COURS</span><h2>Commence par un PDF.</h2><p>Choisis un cours enregistré sur ton appareil. Cette première version vérifie le fichier localement ; l’envoi vers un espace personnel sécurisé sera activé après configuration du backend.</p><ul><li><CheckCircle2 size={18} /> Fichier PDF uniquement</li><li><CheckCircle2 size={18} /> Taille maximale actuelle : 20 Mo</li><li><LockKeyhole size={18} /> Pas d’envoi au serveur à cette étape</li></ul></div><div className="upload-panel"><div className="upload-panel-title"><span className="upload-icon"><UploadCloud size={24} /></span><div><h3>Importer un cours</h3><p>Choisis un fichier PDF depuis ton appareil.</p></div></div><button className="dropzone" onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}><span className="dropzone-icon"><Plus size={22} /></span><strong>Cliquer pour choisir un fichier</strong><span>ou déposer le PDF ici</span><small>PDF · 20 Mo maximum</small></button><input ref={fileInput} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={e => handleFile(e.target.files?.[0])} />{selectedFile && <div className="file-selected"><FileText size={20} /><span><strong>{selectedFile.name}</strong><small>{formatSize(selectedFile.size)} · sélectionné localement</small></span><button aria-label="Retirer le fichier" onClick={() => { setSelectedFile(null); setNotice(''); if (fileInput.current) fileInput.current.value = ''; }}><X size={17} /></button></div>}{notice && <div className="notice" role="status"><CircleHelp size={17} />{notice}</div>}<button className="button button-primary upload-submit" onClick={async () => {
        if (!selectedFile) { setNotice('Sélectionne d’abord un fichier PDF.'); return; }
        if (!signedInName) { setNotice('Connecte-toi ou crée un compte pour préparer ton espace de cours.'); setAuthOpen(true); return; }
        if (!isSupabaseConfigured || !supabase) { setNotice('Ton compte est connecté, mais le stockage sécurisé n’est pas encore configuré. Le PDF n’a pas été envoyé.'); return; }
        const { data: userData } = await supabase.auth.getUser();
        const file = fileInput.current?.files?.[0];
        if (!userData.user || !file) { setNotice('Choisis à nouveau le PDF avant de continuer.'); return; }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = userData.user.id + '/' + crypto.randomUUID() + '-' + safeName;
        const { error: uploadError } = await supabase.storage.from('course-pdfs').upload(path, file, { contentType: 'application/pdf', upsert: false });
        if (uploadError) { setNotice('Échec de l’envoi : ' + uploadError.message); return; }
        const { error: insertError } = await supabase.from('courses').insert({ user_id: userData.user.id, title: file.name.replace(/\.pdf$/i, ''), original_filename: file.name, storage_path: path, file_size_bytes: file.size, status: 'uploaded' });
        if (insertError) { await supabase.storage.from('course-pdfs').remove([path]); setNotice('Le fichier a été envoyé mais son enregistrement a échoué : ' + insertError.message); return; }
        setNotice('Cours importé dans ton espace sécurisé. L’extraction du texte et la génération IA restent à configurer.');
      }}>Continuer <ChevronRight size={17} /></button></div></div></section>

        <section className="security-section wrap" id="securite"><span className="security-icon"><ShieldCheck size={25} /></span><div><h2>La confiance avant tout</h2><p>Pas de faux résultats ni de fausses statistiques. L’authentification, le stockage privé et les fonctions IA seront activés avec une configuration serveur sécurisée et des règles d’accès adaptées.</p></div><span className="security-tag">Construction progressive</span></section>
      </main>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSignedIn={name => setSignedInName(name)} />}
      <footer className="footer"><div className="wrap footer-inner"><a className="brand footer-brand" href="#accueil"><span className="brand-mark"><BookOpen size={20} /></span><span>Révise<span className="brand-ci">CI</span><small>APPRENDS. RÉVISE. RÉUSSIS.</small></span></a><p>© {new Date().getFullYear()} RéviseCI · Pensé pour les étudiants francophones.</p><a href="#securite">Confidentialité et sécurité</a></div></footer>
    </div>
  );
}
