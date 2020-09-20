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
      return data;
    });
}

const getProjectOptions = () =>
  api<Project[]>(`${gitlabSite}/api/v4/projects/?private_token=${token}&archived=false&simple=true`)
    .then(data =>
      data.map(({ name, id }) => ({
        label: name,
        value: id
      }))
    )
    .catch(error => {
      throw new Error(error);
    });

const createSelect = (options: Option[]) => {
  const select = document.createElement("select");

  [{ label: "Select Project", value: null }, ...options].map(
    ({ label, value }) => {
      const optionEl = document.createElement("option");

      optionEl.innerText = label;

      if (value) {
        optionEl.value = value;
      }

      select.appendChild(optionEl);
    }
  );

  return select;
};

const isJiraProjectPage = window.location.href.includes(`${jiraSite}/`);

if (isJiraProjectPage) {
  const releaseNoteId = "release-report-notes-link";

  getProjectOptions().then(options => {
    const selectEl = createSelect(options);

    document
      .querySelector(`#${releaseNoteId}`)
      .closest("p")
      .after(selectEl);
  });
}
