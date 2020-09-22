interface Project {
  readonly id: number;
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

interface SelectType {
    project: 'project';
    release: 'release';
}

const gitlabSite = process.env.GITLAB_RESOURCE || "";
const jiraSite = process.env.JIRA_RESOURCE || "";

const token = process.env.PRIVATE_TOKEN || "";

const parentSelector = "top-level-version-info";

const selectTypes: SelectType = {
    project: 'project',
    release: 'release'
}

const api = <T>(url: string): Promise<T> => {
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
  api<Project[]>(
    `${gitlabSite}/api/v4/projects/?private_token=${token}&archived=false&simple=true`
  )
    .then(data =>
      data.map(({ name, id }) => ({
          label: name,
          value: String(id)
      })) || []
    )
    .catch(error => {
      throw new Error(error);
    });

const getReleaseOptions = projectId =>
  api<Tag[]>(
    `${gitlabSite}/api/v4/projects/${projectId}/releases?private_token=${token}&archived=false&simple=true`
  )
    .then(data =>
      data.map(({ name, tag_name }) => ({
          value: tag_name,
          label: name
      })) || []
    )
    .catch(error => {
      throw new Error(error);
    });

const createSelect = (type: string, options: Option[]) => {
  const select = document.createElement("select");

  select.dataset.type = type;
  select.disabled = options.length === 1

  options.map(
    ({ label, value }) => {
      const optionEl = document.createElement("option");

      optionEl.innerText = label;

      if (value) {
        optionEl.value = value;
      }

      select.appendChild(optionEl);
    }
  );

  document
    .querySelector(`.${parentSelector}`)
    .appendChild(select);

  return select;
};

const removeSelect = (type: string) => {
    document.querySelector(`select[data-type="${type}"]`)?.remove()
}

const createProjectSelect = () =>
    getProjectOptions().then((options = []) =>
        createSelect(
            selectTypes.project,
            [{ label: `Select project`, value: null }, ...options]
        )
    );


const createTagsSelect = projectId => {
    if (!projectId) {
        return
    }

    getReleaseOptions(projectId).then((options = []) =>
        createSelect(
            selectTypes.release,
            [{ label: `Select release tag`, value: null }, ...options]
        )
    );
}


const isJiraProjectPage = window.location.href.includes(`${jiraSite}/`);

if (isJiraProjectPage) {
  createProjectSelect().then(select => {
      select.onchange = () => {
          if (select.value) {
              removeSelect(selectTypes.release)

              createTagsSelect(select.value)
          } else {
              removeSelect(selectTypes.release)
          }
      }
  });
}
