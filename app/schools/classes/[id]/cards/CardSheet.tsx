/**
 * The sheet itself: one card per child, two across, ten to a page of A4.
 *
 * Separated from the page on purpose. The page's job is the gate and the
 * query, which cannot be looked at; this is the part that has to be LOOKED
 * at, on screen and on paper, and keeping it props-in means it can be
 * rendered with made-up names and checked without a database behind it.
 *
 * It holds no secret. A card carries a first name, the address that opens
 * the list of names, and what to tap. The picture password is chosen by the
 * child on first sign-in, stored hashed, and never printed or hinted at
 * here: a sheet of these left on a desk gives away a first name and a code
 * that was on the board all lesson.
 */
export interface CardPupil {
  id: string;
  name: string;
}

export default function CardSheet({
  pupils,
  link,
  className,
  courseName,
  code,
  groupWord,
}: {
  pupils: CardPupil[];
  /** The short class link, without the https://, as a teacher writes it up. */
  link: string;
  className: string;
  courseName: string;
  code: string;
  /** "Class" or "Group", capitalised, from the customer's own vocabulary. */
  groupWord: string;
}) {
  return (
    <div className="sheet">
      {pupils.map((p) => (
        <article className="card" key={p.id}>
          <h2 className="cname">{p.name}</h2>
          <p className="cgo">Go to</p>
          <p className="clink">{link}</p>
          <ol className="csteps">
            <li>
              <b>1.</b> Tap your name.
            </li>
            <li>
              <b>2.</b> Tap your three pictures.
            </li>
            <li>Keep your pictures secret.</li>
          </ol>
          <p className="cfoot">
            <span>
              {className}
              {" · "}
              {courseName}
            </span>
            {/* The spaces around the middot are explicit. JSX drops the
                whitespace between an expression and the next line's text,
                and the first print of these read "HQRT-9FK· AlgorithmX". */}
            <span>
              {groupWord} code {code}
              {" · AlgorithmX"}
            </span>
          </p>
        </article>
      ))}
    </div>
  );
}
