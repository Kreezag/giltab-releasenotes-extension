const dotenv = require("dotenv");

console.log("Hello world");

interface Project {
  readonly id: string;
  readonly name: string;
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
         throw new Error(error)
      /* show error message */
    });

const isJiraProjectPage = window.location.href.includes(`${jiraSite}/`);

if (isJiraProjectPage) {
  getProjectOptions().then(options => console.log("options", options));
}
