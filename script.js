/*
 * script.js
 *
 * This script dynamically fetches the latest publications from a
 * Google Scholar profile and populates them into the page. By
 * default it uses the AllOrigins proxy to bypass CORS restrictions
 * when requesting pages from scholar.google.com. Replace the
 * `scholarUserId` variable with the unique identifier for your
 * Google Scholar profile (the value after `user=` in the profile URL).
 *
 * The script gracefully handles network failures and will display
 * an error message if the publications cannot be loaded.
 */

document.addEventListener('DOMContentLoaded', () => {
  const pubList = document.getElementById('pub-list');
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /**
   * Unique Scholar ID for the author. Replace this placeholder with
   * your Google Scholar user ID (found in the URL of your profile,
   * e.g. https://scholar.google.com/citations?user=abcd1234).
   */
  const scholarUserId = 'EQ4zgzgAAAAJ';

  /**
   * Fetches and parses the author’s publications list from Google
   * Scholar. The function uses a public CORS proxy (AllOrigins) to
   * access the HTML, then extracts up to the first 10 results.
   */
  async function updatePublications() {
    if (!scholarUserId || scholarUserId === 'REPLACE_WITH_SCHOLAR_USER_ID') {
      pubList.innerHTML = '<li>Please replace the Scholar user ID in script.js to enable publication updates.</li>';
      return;
    }
    // Construct the Scholar URL: view_op=list_works returns a list of
    // publications sorted by date when sortby=pubdate is set.
    const targetUrl = `https://scholar.google.com/citations?view_op=list_works&hl=en&user=${encodeURIComponent(scholarUserId)}&sortby=pubdate`;
    // Use AllOrigins proxy to avoid CORS errors
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl);
    pubList.innerHTML = '<li>Loading publications…</li>';
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('tr.gsc_a_tr');
      // Clear the list
      pubList.innerHTML = '';
      let count = 0;
      rows.forEach(row => {
        if (count >= 10) return; // limit to 10 most recent
        const titleAnchor = row.querySelector('.gsc_a_t a');
        const authorsSpan = row.querySelector('.gsc_a_t .gs_gray'); // first gs_gray = authors
        const yearSpan = row.querySelector('.gsc_a_y span');
        const title = titleAnchor ? titleAnchor.textContent.trim() : 'Untitled';
        const link = titleAnchor ? 'https://scholar.google.com' + titleAnchor.getAttribute('href') : '#';
        const authors = authorsSpan ? authorsSpan.textContent.trim() : '';
        const year = yearSpan ? yearSpan.textContent.trim() : '';
        // Create list item
        const li = document.createElement('li');

        // Create the anchor with the title
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.textContent = title;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        li.appendChild(anchor);

        // Add authors and year as plain text (no duplication)
        if (authors || year) {
          const meta = document.createElement('span');
          meta.textContent = ` — ${authors}${authors && year ? ', ' : ''}${year}`;
          li.appendChild(meta);
        }

        pubList.appendChild(li);

        // Add a break after each item
pubList.appendChild(document.createElement('br'));
        count++;
      });
      if (count === 0) {
        pubList.innerHTML = '<li>No publications found or the profile is private.</li>';
      }
    } catch (err) {
      console.error(err);
      pubList.innerHTML = '<li>Unable to load publications. Please check your network connection or ensure the Scholar ID is correct.</li>';
    }
  }

  // Invoke the fetch on page load
  updatePublications();
});
