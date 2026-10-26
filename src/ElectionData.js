class ElectionData {
  /** fetches and parses a ballot file */
  static async fromBallotFile(url){
    const text = await fetch(url).then(r=>r.text());
    return ElectionData.parse(text);
  }

  /** Parses ballot text directly */
  static fromBallotText(text) {
    return ElectionData.parse(text);
  } // end fromBallotText

  /* ---------- ElectionData.js (only the two helpers below change) ---------- */

  static parse(text) {
      const lines = (text || '').split(/\r?\n/);
      const candidateMap = {};          // long → short
      const candidates   = {};          // short → long
      const ballots      = [];
      let parsingCandidates = true;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (parsingCandidates) {
          if (line.startsWith('-') || line.startsWith('=')) { parsingCandidates = false; continue; }
          if (!line.includes(':')) continue;
          const [short, longWithBrackets] = line.split(':').map(s => s.trim());
          const long = (longWithBrackets || short).split('[')[0].trim();
          if (short && long) {
            candidateMap[long] = short;
            candidates[short]  = long;
          }
        } else {
          if (line.startsWith('-') || line.startsWith('=')) continue;

          const processBallotLine = (textLine, lineCount) => {
            let ballotStr = textLine;
            let ballotName = null;
            const nameMatch = textLine.match(/^(.*?)\s*\[(.*?)\]\s*$/);
            if (nameMatch) {
              ballotStr = nameMatch[1].trim();
              ballotName = nameMatch[2].trim();
            }
            return {
              count: lineCount,
              ranks: ElectionData.parseBallot(ballotStr, candidateMap),
              name: ballotName
            };
          };

          if (line.includes(':')) {
            const [countStr, ballotPart] = line.split(':', 2);
            const count = parseInt(countStr.trim(), 10);
            ballots.push(processBallotLine(ballotPart.trim(), isNaN(count) ? 1 : count));
          } else {
            ballots.push(processBallotLine(line, 1));
          }
        }
      }
      return { candidates, ballots };
    }
 // end parse

  static parseBallot(ballotStr, cmap){
    // handles ties with '='   (e.g. "a=b>c")
    // trims every token and converts long → short where needed
    return ballotStr.split('>').map(group=>{
      const toks = group.split('=').map(tok=>{
        const clean = tok.trim();
        return cmap[clean] || clean;               // long → short OR keep as-is
      });
      return toks.length === 1 ? toks[0] : toks;   // single or tied group
    });
  }

  static _export = (() => {
      if (typeof globalThis !== 'undefined') globalThis.ElectionData = ElectionData;
      if (typeof window !== 'undefined') window.ElectionData = ElectionData;
      if (typeof module !== 'undefined' && module.exports) module.exports = ElectionData;
      return true;
    })();
// end parseBallot

} 