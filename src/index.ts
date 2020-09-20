const dotenv = require("dotenv");

console.log("Hello world");

interface Project {
  readonly id: string;
  readonly name: string;
}

interface Option {
  label: string;
  value: string;
}
const gitlabSite = process.env.GITLAB_RESOURCE || "";
const jiraSite = process.env.JIRA_RESOURCE || "";

const token = process.env.PRIVATE_TOKEN || "";

function api<T>(url: string): Promise<T> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
      /* <-- data inferred as { data: T }*/
      return data;
    });
}

// Consumer - consumer remains the same
const getProjectOptions = () =>
  api<Project[]>(`${gitlabSite}/api/v4/projects/`)
    .then(data =>
      data.map(({ name, id }) => ({
        label: name,
        value: id
      }))
    )
    .catch(error => {
      throw new Error(error);
      /* show error message */
    });

const createSelect = (options: Option[]) => {
  const select = document.createElement("select");

    [{ label: "Select Project", value: null }, ...options].map(({ label, value }) => {
      const optionEl = document.createElement('option')

      optionEl.value = value

      if (label) {
        optionEl.innerText = label
      }

      select.appendChild(optionEl)
  })

    return select
};

const isJiraProjectPage = window.location.href.includes(`${jiraSite}/`);

if (isJiraProjectPage) {
    const releaseNoteId = 'release-report-notes-link'

  getProjectOptions().then(options => {
      const selectEl  = createSelect(options)

      document.querySelector(`#${releaseNoteId}`).closest('p').after(selectEl)
  });
}
