require("dotenv").config();

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

const isJiraProjectPage = window.location.href.includes(
  `${jiraSite}/projects/`
);

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
const getProjectOptions = () => api<Project[]>(`${gitlabSite}/api/v4/projects/`)
  .then(data =>
    data.map(({ name, id }) => ({
      label: name,
      value: id
    }))
  )
  .catch(error => {
    /* show error message */
  });

if (document) {
  document.addEventListener("DOMContentLoaded", function(event) {
    if (isJiraProjectPage) {
        getProjectOptions().then((options) => console.log('options', options))
    }
  });
}
