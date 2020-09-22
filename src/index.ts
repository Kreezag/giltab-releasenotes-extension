interface Project {
  readonly id: string;
  readonly name: string;
}

interface Tag {
  readonly tag_name: string;
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
  api<Tag[]>(
    `${gitlabSite}/api/v4/projects/?private_token=${token}&archived=false&simple=true`
  )
    .then(data =>
      data.map(({ name, tag_name }) => ({
        value: tag_name,
        label: name
      }))
    )
    .catch(error => {
      throw new Error(error);
    });

const getTagsOptions = projectId =>
  api<Project[]>(
    `${gitlabSite}/api/v4/projects/${projectId}/releases?private_token=${token}&archived=false&simple=true`
  )
    .then(data =>
      data.map(({ name, id }) => ({
        label: name,
        value: id
      }))
    )
    .catch(error => {
      throw new Error(error);
    });

const createSelect = (type: string, options: Option[]) => {
  const select = document.createElement("select");

  select.dataset.type = type;

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

const createProjectSelect = () =>
    getProjectOptions().then(options => {
        const selectEl = createSelect('product', options);

        setSelect(selectEl);

        return selectEl;
    });

const createTagsSelect = projectId => {
    if (!projectId) {

    }

    getTagsOptions(projectId).then(options => {
        const selectEl = createSelect('tags', options);

        setSelect(selectEl);

        return selectEl;
    });
}


const setSelect = (selectEl) => {
    const releaseNoteId = "release-report-notes-link";

    document
        .querySelector(`#${releaseNoteId}`)
        .closest("p")
        .after(selectEl);
}

const removeSelect = (type: string) => {
    document.querySelector(`select[data-type="${type}"]`)?.remove()
}

const isJiraProjectPage = window.location.href.includes(`${jiraSite}/`);

if (isJiraProjectPage) {
  createProjectSelect().then(select => {
      select.onchange = () => {
          if (select.value) {
              createTagsSelect(select.value)
          } else {
              removeSelect('tags')
          }
      }
  });
}
