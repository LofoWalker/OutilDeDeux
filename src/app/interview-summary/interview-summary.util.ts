export function generateInterviewSummary(): string {
  // Récupérer les réponses et notes générales depuis le localStorage
  const data = localStorage.getItem('questions-answers');
  const answers = data ? JSON.parse(data) : [];
  const generalNotes = localStorage.getItem('general-notes') || '';

  // Calcul de la moyenne globale
  const notes = answers.map((a: any) => a.note).filter((n: number) => typeof n === 'number');
  const globalAvg = notes.length ? (notes.reduce((a: number, b: number) => a + b, 0) / notes.length) : undefined;

  let txt = `Résumé d'entretien\n\n`;
  txt += `Moyenne générale : ${globalAvg !== undefined ? globalAvg.toFixed(2) : '?'} / 5\n\n`;
  txt += `Notes générales :\n`;
  txt += generalNotes ? `  ${generalNotes.replace(/\n/g, '\n  ')}\n\n` : '  (Aucune note générale)\n\n';
  txt += `----------------------------------------\n`;

  // Grouper par catégorie
  const byCat: { [cat: string]: any[] } = {};
  for (const ans of answers) {
    const catKey = ans.categorie || 'Autre';
    if (!byCat[catKey]) byCat[catKey] = [];
    byCat[catKey].push(ans);
  }

  for (const cat of Object.keys(byCat)) {
    txt += `\n${cat.toUpperCase()}\n`;
    for (const ans of byCat[cat]) {
      const note = ans.note !== undefined ? ans.note : '?';
      const comment = ans.comment ? ans.comment.replace(/\n/g, ' ') : '';
      // Convert numeric difficulty to label
      const difficultyLabels = ['Junior', 'Confirmé', 'Senior', 'Expert'];
      let difficulteLabel = ans.difficulte;
      if (typeof ans.difficulte === 'number' && ans.difficulte >= 1 && ans.difficulte <= 4) {
        difficulteLabel = difficultyLabels[ans.difficulte - 1];
      }
      txt += `  Difficulté : ${difficulteLabel}\n`;
      txt += `  Question   : ${(ans.question ?? '').replace(/\n/g, ' ')}\n`;
      txt += `  Note       : ${note} / 5\n`;
      txt += `  Commentaire: ${comment || '(aucun)'}\n`;
      txt += `\n`;
    }
    txt += `----------------------------------------\n`;
  }
  return txt;
}
