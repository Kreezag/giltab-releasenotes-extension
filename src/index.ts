import { requestAggregator } from "./requestAggregator";
import { createRequestUrl } from "./requestUrl";
import {
    GITLAB_SITE,
    JIRA_SITE,
    PARENT_SELECTOR,
    SELECT_DEFAULT,
    STORAGE_KEY,
    SELECT_TYPE,
    TOKEN
} from "./constant";



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

const createProjectsUrl = (page) => createRequestUrl(GITLAB_SITE, {
    pathname: '/api/v4/projects/',
    protocol: 'https',
    search: {
        page: page,
        private_token: TOKEN,
        archived: 'false',
        simple: 'true',
        sort: 'asc'
    },
})

const createTagsUrl = (projectId, page) => createRequestUrl(GITLAB_SITE, {
    pathname: `/api/v4/projects/${projectId}/releases/`,
    protocol: 'https',
    search: {
        page: page,
        private_token: TOKEN,
        archived: 'false',
        simple: 'true',
        sort: 'asc'
    },
})



const api = <T>(url: string): Promise<T> => {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
};

const getProjectOptionsByPage = (page: number = 0) =>
  api<Project[]>(createProjectsUrl(page))
    .then(data => data.map(({ name, id }) => ({ label: name, value: String(id) })) || [])
    .catch(error => {
      throw new Error(error);
    });

const getReleaseOptions = (projectId, page) =>
  api<Tag[]>(createTagsUrl(projectId, page))
    .then(data => data.map(({ name, tag_name }) => ({ value: tag_name, label: name })) || [])
    .catch(error => {
      throw new Error(error);
    });



const makePlaceholderOptionData = (name: string): Option => ({ label: `- Select ${name} -`, value: SELECT_DEFAULT });

const applySelectOption = (selectEl: HTMLSelectElement, option: Option) => {
    const optionEl = document.createElement("option");

    optionEl.innerText = option.label;
    optionEl.value = option.value;

    selectEl.appendChild(optionEl);

    return optionEl;
};



const createSelect = (type: string, optionsData: Option[]) => {
  const selectEl: HTMLSelectElement = document.createElement("select");

  selectEl.dataset.type = type;
  selectEl.disabled = (optionsData.length === 0);

  [makePlaceholderOptionData(type), ...optionsData].forEach(
    (option) => applySelectOption(selectEl, option)
  );

  document
    .querySelector(`.${PARENT_SELECTOR}`)
    .appendChild(selectEl);

  return selectEl;
};


const setSelectOptions = (selectEl: HTMLSelectElement, optionsData: Option[] = []) => {
    selectEl.disabled = (optionsData.length == 0);
    optionsData.forEach((option) =>  applySelectOption(selectEl, option))
};



const removeSelect = (type: string) => {
    document.querySelector(`select[data-type="${type}"]`)?.remove();
};

const updateReleaseSelect = (projectId) => {
    const selectEl: HTMLSelectElement = document.querySelector(`select[data-type="${SELECT_TYPE.RELEASE}"]`);

    const createReleaseSelect = (optionsData) => createSelect(
        SELECT_TYPE.RELEASE,
        optionsData
    );

    if (!selectEl) {
        requestAggregator((page) => getReleaseOptions(projectId, page), createReleaseSelect);

        return;
    }

    selectEl.querySelectorAll('option').forEach((optionEl) => {
        if (optionEl.value !== SELECT_DEFAULT) {
            optionEl.remove()
        }
    });

    requestAggregator((page) =>
        getReleaseOptions(projectId, page),
        (optionsData: Option[]) => setSelectOptions(selectEl, optionsData)
    )
};



const isJiraProjectPage = window.location.href.includes(`${JIRA_SITE}/`);
const isReleaseJiraPage = document.querySelector(`.${PARENT_SELECTOR}`)



if (isJiraProjectPage && isReleaseJiraPage) {
    const updateProjectSelect = (optionsData: Option[]) => {
        const storedKeys = window.localStorage.getItem(STORAGE_KEY) || null;
        const storedKeyList = storedKeys ? storedKeys.split(',') : []
        const filteredOptionsData = storedKeyList.length ? optionsData.filter(({ value }) => storedKeyList.includes(value)) : optionsData

        const existedSelect: HTMLSelectElement = document.querySelector(`select[data-type="${SELECT_TYPE.PROJECT}"]`)

        if (existedSelect) {
            existedSelect.querySelectorAll('option').forEach((optionEl) => {
                if (optionEl.value !== SELECT_DEFAULT) {
                    optionEl.remove()
                }
            });

            setSelectOptions(existedSelect, filteredOptionsData)

        } else {
            const select = createSelect(SELECT_TYPE.PROJECT, filteredOptionsData);

            select.onchange = () => {
                if (select.value !== SELECT_DEFAULT) {
                    updateReleaseSelect(select.value)
                } else {
                    removeSelect(SELECT_TYPE.RELEASE)
                }
            }
        }
    };

    const runSelects = () => requestAggregator((page) => getProjectOptionsByPage(page), updateProjectSelect);

    const storageUpdate = (value: string|null = null) => {
        console.log('update', JSON.stringify(value))
        if (value) {
            window.localStorage.setItem(STORAGE_KEY, value);
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
        runSelects();
    }

    const createInputConfig = () => {
        const input = document.createElement('input')

        input.type = 'search';
        input.value = window.localStorage.getItem(STORAGE_KEY);

        input.onchange = (event) => {
            console.log('event_change', event)
            if (input.value === '') {
                storageUpdate(null)
            }
        }

        input.onkeypress = (event) => {
            console.log('event_keypress', event)
            if (event.code === 'Enter' && input.value) {
                storageUpdate(input.value.replace(/[^0-9,]+/gi, ''));
            }
        };

        document
            .querySelector(`.${PARENT_SELECTOR}`)
            .after(input)
    };


    runSelects();
    createInputConfig();
}


