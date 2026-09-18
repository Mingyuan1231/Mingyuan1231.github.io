export function renderCv(academic, papers, { esc, authors, paperStatus, publicationReference, config }) {
  const timeline = entries => entries.map(entry => `
    <div class="cv-row">
      <div class="date">${esc(entry.period)}</div>
      <div><h3>${esc(entry.title)}</h3><p>${esc(entry.institution)}</p>
      ${entry.details ? `<p class="muted">${esc(entry.details)}</p>` : ''}</div>
    </div>`).join('');
  const publicationEntries = entries => entries.map(p => `
    <li><a href="/publications/${p.slug}/">${esc(p.title)}</a>
      <p class="authors">${authors(p)}</p>
      <p class="cv-publication-meta">${publicationReference(p)} · ${esc(paperStatus(p))}</p>
    </li>`).join('');
  const sections = [
    ['profile', 'Research profile'], ['education', 'Education'],
    ['research-experience', 'Research experience'], ['publications', 'Publications'],
    ['talks', 'Selected talks'], ['expertise', 'Technical expertise'],
    ['service', 'Leadership & teaching'], ['earlier-research', 'Earlier research'],
    ['contact', 'Contact'],
  ];
  return `<div class="cv-layout">
    <aside class="cv-index"><nav aria-label="Academic profile sections">
      ${sections.map(([id,label]) => `<a href="#${id}">${label}</a>`).join('')}
    </nav></aside>
    <div class="cv-content">
      <section id="profile"><h2>Research profile</h2><p>${esc(academic.profile)}</p></section>
      <section id="education"><h2>Education</h2>${timeline(academic.education)}</section>
      <section id="research-experience"><h2>Research experience</h2>
        ${timeline([academic.currentRole])}
        ${academic.projects.map(project => `<article class="cv-project">
          <p class="project-status">${esc(project.status)}</p>
          <h3>${project.url ? `<a href="${project.url}">${esc(project.title)}</a>` : esc(project.title)}</h3>
          <ul>${project.points.map(point => `<li>${esc(point)}</li>`).join('')}</ul>
        </article>`).join('')}
      </section>
      <section id="publications"><h2>Publications & manuscripts</h2>
        <h3>Manuscript in preparation</h3>
        <ol class="cv-publications">${academic.manuscripts.map(p => `<li><a href="${p.url}">${esc(p.title)}</a><p class="authors">${authors(p)}</p><p class="cv-publication-meta">${esc(p.status)}</p></li>`).join('')}</ol>
        <h3>Preprints</h3><ol class="cv-publications">${publicationEntries(papers.filter(p => !p.journal))}</ol>
        <h3>Journal articles</h3><ol class="cv-publications">${publicationEntries(papers.filter(p => p.journal))}</ol>
      </section>
      <section id="talks"><h2>Selected research talks</h2>
        ${academic.talks.map(talk => `<div class="cv-row"><div class="date">${esc(talk.date)}</div><div><h3>${esc(talk.title)}</h3><p>${talk.url ? `<a href="${talk.url}">${esc(talk.event)}</a>` : esc(talk.event)}<br>${esc(talk.location)}</p></div></div>`).join('')}
      </section>
      <section id="expertise"><h2>Technical expertise</h2>
        <dl class="expertise-list">${academic.expertise.map(item => `<dt>${esc(item.title)}</dt><dd>${esc(item.details)}</dd>`).join('')}</dl>
      </section>
      <section id="service"><h2>Leadership & teaching</h2>
        <h3>${esc(academic.service.title)}</h3><p>${esc(academic.service.organization)}</p>
        ${timeline(academic.teaching)}
      </section>
      <section id="earlier-research"><h2>Earlier research experience</h2>${timeline(academic.earlierRoles)}</section>
      <section class="contact" id="contact"><h2>Get in touch</h2>
        <p><a href="mailto:${config.email}">${config.email}</a></p>
        <p>Department of Physics<br>University of Massachusetts Amherst<br>Amherst, Massachusetts, USA</p>
        <p><a href="${config.lab}">Krastanov Lab</a> · <a href="${config.github}">GitHub</a></p>
      </section>
    </div>
  </div>`;
}
