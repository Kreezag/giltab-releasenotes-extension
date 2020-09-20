require("dotenv").config();

console.log("Hello world");


interface Project {
    readonly id: string;
    readonly name: string;
}

interface Option {
    label: string,
    value: string
}

const site = process.env.RESOURCE || "";

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
const projectOptions = api<Project[]>(`${site}/api/v4/projects/`)
  .then(data => data.map(({ name, id }) => ({
      label: name,
      value: id
    }))
  )
  .catch(error => {
    /* show error message */
  });


console.log(projectOptions);
