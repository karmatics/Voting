// File: src/IrvTabulator.js

class IrvTabulator {
  constructor(electionData) {
    this.data = electionData;
  } // end constructor

  run() {
    // Perform the IRV count and return the data needed for the Sankey diagram widget.
    const irvResults = IRV.tabulate(this.data);
    return irvResults;
  }

  static _export = (() => {
      if (typeof globalThis !== 'undefined') globalThis.IrvTabulator = IrvTabulator;
      if (typeof window !== 'undefined') window.IrvTabulator = IrvTabulator;
      if (typeof module !== 'undefined' && module.exports) module.exports = IrvTabulator;
      return true;
    })();
// end run

} // end class IrvTabulator