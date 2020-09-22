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
    PROJECT: 'project';
    RELEASE: 'release';
}

const gitlabSite = process.env.GITLAB_RESOURCE || "";
const jiraSite = process.env.JIRA_RESOURCE || "";

const token = process.env.PRIVATE_TOKEN || "";

const PARENT_SELECTOR = "top-level-version-info";

const SELECT_TYPE: SelectType = {
    PROJECT: 'project',
    RELEASE: 'release'
}

const SELECT_DEFAULT: string = '-placeholder-';


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


const createPlaceholderOption = (name: string): Option => ({ label: `- Select ${name} -`, value: SELECT_DEFAULT });

const applySelectOption = (selectEl: HTMLSelectElement, option: Option) => {
    const optionEl = document.createElement("option");

    optionEl.innerText = option.label;
    optionEl.value = option.value;

    selectEl.appendChild(optionEl);

    return optionEl
}

const createSelect = (type: string, options: Option[]) => {
  const selectEl: HTMLSelectElement = document.createElement("select");

    selectEl.dataset.type = type;
    selectEl.disabled = (options.length === 0);

  [createPlaceholderOption(type), ...options].forEach(
    (option) => applySelectOption(selectEl, option)
  );

  document
    .querySelector(`.${PARENT_SELECTOR}`)
    .appendChild(selectEl);

  return selectEl;
};

const removeSelect = (type: string) => {
    document.querySelector(`select[data-type="${type}"]`)?.remove()
}

const createProjectSelect = () =>
    getProjectOptions().then((options: Option[] = []) =>
        createSelect(
            SELECT_TYPE.PROJECT,
            options
        )
    );


const createReleaseSelect = (projectId: string) => {
    getReleaseOptions(projectId).then((options: Option[] = []) =>
        createSelect(
            SELECT_TYPE.RELEASE,
            options
        )
    );
}

const updateReleaseSelect = (projectId) => {
    const selectEl: HTMLSelectElement = document.querySelector(`select[data-type="${SELECT_TYPE.RELEASE}"]`)

    if (!selectEl) {
        createReleaseSelect(projectId)

        return;
    }

    selectEl.querySelectorAll('option').forEach((optionEl) => {
        if (optionEl.value !== SELECT_DEFAULT) {
            optionEl.remove()
        }
    })

    getReleaseOptions(projectId).then((options = []) => {
        selectEl.disabled = (options.length == 0);

        options.forEach(
            (option) =>  applySelectOption(selectEl, option)
        )
    })
}


const isJiraProjectPage = window.location.href.includes(`${jiraSite}/`);

if (isJiraProjectPage) {
  createProjectSelect().then(select => {
      select.onchange = () => {
          if (select.value !== SELECT_DEFAULT) {
              updateReleaseSelect(select.value)
          } else {
              removeSelect(SELECT_TYPE.RELEASE)
          }
      }
  });
}
