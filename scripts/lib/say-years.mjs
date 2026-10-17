/**
 * Say a YEAR as a year, not as four separate digits.
 *
 * Owner, 2026-10-17, on week 2's "Your Secret Identity": "it said Emma 2 0 1 7
 * instead of pronouncing the year... if it's a year pronunciation, then say
 * 2017, instead of separate numbers. Again, this is something that we can push
 * across all weeks."
 *
 * There was no pronunciation layer in the generator at all: the line went to
 * the voice exactly as written, and four digits glued to a name came back as
 * four digits. Across the course, 826 strings carry a run of two or more
 * digits and 25 of those read as a year, in weeks 1, 2, 15, 17 and 20. Week 2
 * has eleven, because the whole concept is built on usernames.
 *
 * WHAT THIS MUST NOT DO, which is most of why it is careful:
 *
 *   - Week 1 teaches that "123456" and "12345678" are bad passwords. Reading
 *     those digit by digit is RIGHT; turning them into words would destroy
 *     the line. So only 1900-2099 counts as a year, and only when it stands
 *     clear of other digits, never inside a longer run.
 *   - Week 15 says "nearly 2000 years ago", which is a COUNT and wants "two
 *     thousand", not "twenty hundred".
 *   - The PRINTED word never changes. "emma2017" stays spelled that way on
 *     screen; the app reads the week file directly and never comes through
 *     here. Only what the voice is given changes.
 *
 * Lives in its own module so a test can import it without executing the
 * generator, which does real work at module load.
 */

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = [
  "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function twoDigitWords(n) {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const t = TENS[Math.floor(n / 10)];
  const o = ONES[n % 10];
  return o ? `${t}-${o}` : t;
}

export function sayYears(text) {
  const s = String(text);
  /* The lookarounds are the whole safety story: they keep this away from any
   * longer digit run, so a password stays a password. */
  return s.replace(/(?<![0-9])(19|20)([0-9]{2})(?![0-9])/g, (whole, cHi, rest, offset) => {
    const century = Number(cHi);
    const within = Number(rest);

    let words;
    /* A whole thousand or hundred is a count, not a year: "nearly 2000 years
     * ago" wants "two thousand", never "twenty hundred". */
    if (within === 0) {
      words = century === 20 ? "two thousand" : "nineteen hundred";
    } else if (century === 20 && within < 10) {
      /* 2001-2009 as "two thousand and five", which is how a child hears it
       * read aloud, rather than "twenty oh five". */
      words = `two thousand and ${ONES[within]}`;
    } else {
      /* A space between the halves, not a hyphen: "nineteen ninety-nine" is
       * how it is spoken, and the hyphen belongs inside the second half. */
      words = `${twoDigitWords(century)} ${twoDigitWords(within)}`;
    }

    /* The year is usually GLUED to a name - emma2017, SuperFan2000 - which is
     * the case the owner reported. Without these the replacement runs into
     * the name ("SuperFantwo thousand") and the voice reads that as one word,
     * which is a different wrong pronunciation rather than a fix. */
    const before = offset > 0 ? s[offset - 1] : "";
    const after = s[offset + whole.length] ?? "";
    const lead = /[A-Za-z]/.test(before) ? " " : "";
    const tail = /[A-Za-z]/.test(after) ? " " : "";
    return `${lead}${words}${tail}`;
  });
}
