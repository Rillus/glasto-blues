export default function Changelog() {
  return (
    <main className={"Changelog"}>
      <ol>
        <li>2023-06-05:
          <ul>
            <li>Added a changelog page</li>
            <li>Performance enhancement for Acts page (ActGrid options move to useState)</li>
            <li>Fix end time (was adding, rather than subtracting timezone</li>
          </ul>
        </li>
        <li>2023-06-04:
          <ul>
            <li>Allows filtering by individual days on Acts page</li>
            <li>Adds loading state for lazy-load of acts on Acts page</li>
            <li>Fix for repeating IDs in Acts feed (add orderBy name as well as date)</li>
            <li>Fix end time (was adding, rather than subtracting timezone</li>
          </ul>
        </li>
        <li>2023-06-03:
          <ul>
            <li>Add loading state for lineup add/remove</li>
            <li>Timezone fix for production server</li>
            <li>Fix for some stage pages that were pulling in wrong data (i.e. /other-stage was pulling data for Pyramid Stage</li>
            <li>Adds search field for Acts page</li>
            <li>Renders multiple performances for an act on the actId page</li>
            <li>Allows saving of a particular performance by an act (previously only first instance was saving)</li>
          </ul>
        </li>
        <li>2023-06-02:
          <ul>
            <li>Style fix to show input text content</li>
            <li>Adds Cypres tests for routes</li>
          </ul>
        </li>
        <li>2023-06-02:
          <ul>
            <li>Adds Save to ActChip</li>
            <li>Adds act save functionality</li>
            <li>Adds lazy load for multiple pages of acts on Acts page</li>
            <li>Some styling work to notes, join, acts, stages</li>
          </ul>
        </li>
        <li>2023-05-26:
          <ul>
            <li>Mobile styles</li>
            <li>Adds admin page to update lineup</li>
          </ul>
        </li>
        <li>2023-05-25:
          <ul>
            <li>Adds admin page to update lineup</li>
            <li>Initial commit</li>
            <li>Adds StageChip, DateChip, ActChip, ActGrid</li>
            <li>Adds routes and styles for acts, stages</li>
          </ul>
        </li>
      </ol>
    </main>
  );
}
